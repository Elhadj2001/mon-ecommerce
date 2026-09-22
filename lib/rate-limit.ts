import { NextResponse } from 'next/server'

// Rate limiter en mémoire avec fenêtre glissante simple.
// Convient au dev et aux faibles trafics. Pour la production multi-instances
// (Vercel serverless), migrer vers Upstash Redis :
//   import { Ratelimit } from '@upstash/ratelimit'
//   import { Redis } from '@upstash/redis'
//   const limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, '60 s') })

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export interface RateLimitOptions {
  /** Identifiant unique du bucket (ex: 'checkout', 'promo'). */
  key: string
  /** Nombre de requêtes max dans la fenêtre. */
  limit: number
  /** Durée de la fenêtre en secondes. */
  windowSeconds: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  response?: NextResponse
}

export async function rateLimit(req: Request, opts: RateLimitOptions): Promise<RateLimitResult> {
  const ip = getClientIp(req)
  const bucketKey = `${opts.key}:${ip}`
  const now = Date.now()
  const windowMs = opts.windowSeconds * 1000

  let bucket = buckets.get(bucketKey)
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(bucketKey, bucket)
  }

  bucket.count += 1

  // GC opportuniste pour éviter une croissance mémoire infinie.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k)
    }
  }

  const remaining = Math.max(0, opts.limit - bucket.count)
  if (bucket.count > opts.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      response: NextResponse.json(
        { error: 'Trop de requêtes — réessayez plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(opts.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(bucket.resetAt / 1000)),
          },
        },
      ),
    }
  }

  return { allowed: true, remaining, resetAt: bucket.resetAt }
}

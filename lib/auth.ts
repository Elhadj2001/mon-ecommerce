import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

export type AdminCheckResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }

export async function isAdminUser(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false
  if (ADMIN_USER_IDS.includes(userId)) return true

  const user = await currentUser()
  return user?.publicMetadata?.role === 'admin'
}

export async function requireAdmin(): Promise<AdminCheckResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
    }
  }

  if (!(await isAdminUser(userId))) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accès refusé : droits admin requis' }, { status: 403 }),
    }
  }

  return { ok: true, userId }
}

export async function requireAuth(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const { userId } = await auth()
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
    }
  }
  return { ok: true, userId }
}

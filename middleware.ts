import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)'])
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/products(.*)',
  '/account(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    await auth.protect()
    return
  }

  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
    const isAdmin = role === 'admin' || ADMIN_USER_IDS.includes(userId)

    if (!isAdmin) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Accès refusé : droits admin requis' },
          { status: 403 },
        )
      }
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
});

export const config = {
  matcher: [
    // Expression régulière optimisée pour ignorer les assets et les fichiers internes
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours traiter les appels API
    '/(api|trpc)(.*)',
  ],
};

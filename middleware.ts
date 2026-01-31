import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protection des routes /admin et des routes d'API sensibles
const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/api/products(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Si la route est protégée, Clerk vérifie la session
    await auth.protect();
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
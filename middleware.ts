import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit les routes qui nécessitent une protection (tout ce qui commence par /admin)
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Si l'utilisateur essaie d'aller sur /admin ET qu'il n'est pas connecté...
  if (isProtectedRoute(req)) {
    // ... on le redirige vers la page de connexion Clerk, et on le renverra ici après.
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ignore les fichiers statiques de Next.js et les images
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les routes API
    '/(api|trpc)(.*)',
  ],
};
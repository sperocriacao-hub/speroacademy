import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'en',
    localePrefix
});

// Define public routes that don't require authentication.
// Notice we use a regex to allow any locale prefix (e.g., /en/sign-in, /pt-BR/sign-in)
const isPublicRoute = createRouteMatcher([
    '/:locale/sign-in(.*)',
    '/:locale/sign-up(.*)',
    '/:locale', // Localized Landing page
    '/', // Root Landing page
    '/api/webhook/clerk(.*)', // Webhooks need to be public
    '/api/uploadthing(.*)'
]);

export default clerkMiddleware((auth, request) => {
    // 1. Run the Clerk authentication check
    if (!isPublicRoute(request)) {
        auth().protect();
    }

    // 2. Return the next-intl middleware response to handle locale routing
    return intlMiddleware(request);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

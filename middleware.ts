import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

import { NextResponse } from 'next/server';

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
    '/api/uploadthing(.*)',
    '/:locale/admin/login(.*)' // Admin login is public (Clerk-wise)
]);

export default clerkMiddleware((auth, request) => {
    const { pathname } = request.nextUrl;

    const isApiAdminRoute = pathname.startsWith('/api/admin');
    const isPageAdminRoute = pathname.match(/^\/([a-zA-Z-]+\/)?admin(\/.*)?$/);
    const isAdminLogin = pathname.includes('/admin/login');

    if (isApiAdminRoute) {
        const adminSession = request.cookies.get('master_admin_session')?.value;
        if (adminSession !== 'true') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        // Let API proceed naturally, no intlMiddleware needed
        return NextResponse.next();
    }

    if (isPageAdminRoute) {
        const locale = pathname.split('/')[1];
        const hasLocale = locales.includes(locale as any);
        const currentLocale = hasLocale ? locale : null;

        // Force Portuguese (pt-BR or pt-PT) for Admin routes
        if (!currentLocale || (currentLocale !== 'pt-BR' && currentLocale !== 'pt-PT')) {
            const url = request.nextUrl.clone();
            const rest = pathname.substring(pathname.indexOf('/admin') + 6);
            url.pathname = `/pt-BR/admin${rest}`;
            return NextResponse.redirect(url);
        }

        // Verify custom admin cookie for secure admin pages
        if (!isAdminLogin) {
            const adminSession = request.cookies.get('master_admin_session')?.value;
            if (adminSession !== 'true') {
                const url = request.nextUrl.clone();
                url.pathname = `/${currentLocale}/admin/login`;
                return NextResponse.redirect(url);
            }
        }

        return intlMiddleware(request);
    }

    // 1. Run the Clerk authentication check
    if (!isPublicRoute(request) && !pathname.startsWith('/api/uploadthing')) {
        auth().protect();
    }

    if (pathname.startsWith('/api')) {
        return NextResponse.next();
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

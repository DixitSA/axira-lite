import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes through without any checks
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // All other routes require authentication
  const { userId, sessionClaims } = await auth.protect()

  // Check if onboarding is complete via Clerk metadata
  const onboardingComplete =
    (sessionClaims?.metadata as Record<string, unknown>)?.onboardingComplete === true

  if (!onboardingComplete) {
    const onboardingUrl = new URL('/onboarding', req.url)
    return NextResponse.redirect(onboardingUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

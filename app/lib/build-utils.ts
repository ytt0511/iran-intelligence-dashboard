/**
 * Build-time detection utilities
 * Used to skip API calls during Vercel/Next.js build process
 */

/**
 * Check if we're currently in build/static generation mode
 * This is used to skip external API calls that would timeout during build
 */
export function isBuildTime(): boolean {
  // Vercel build detection
  if (process.env.VERCEL === '1' && process.env.CI === 'true') {
    return true;
  }

  // Next.js build phase detection
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return true;
  }

  // Static export detection
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && process.env.NEXT_PHASE === undefined) {
    return true;
  }

  // General build detection - when running in production but without a runtime context
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !isServerRuntime()) {
    return true;
  }

  return false;
}

/**
 * Check if we're in a server runtime context (not build time)
 */
function isServerRuntime(): boolean {
  // If we have a request context or headers, we're in runtime
  try {
    // @ts-ignore - accessing Next.js internal
    if (typeof headers !== 'undefined' && typeof headers === 'function') {
      return true;
    }
  } catch (e) {
    // Ignore errors
  }

  // Check for runtime-specific environment variables
  if (process.env.VERCEL_REGION || process.env.VERCEL_URL) {
    return true;
  }

  return false;
}

/**
 * Throw an error if we're in build time
 * Use this to skip expensive operations during build
 */
export function skipIfBuildTime(): void {
  if (isBuildTime()) {
    throw new Error('SKIP_BUILD_TIME_API_CALL');
  }
}

/**
 * Return a build-time skip response for Next.js API routes
 */
export function buildTimeSkipResponse(message = 'Skipping during build') {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    buildTime: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

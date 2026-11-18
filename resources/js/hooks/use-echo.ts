/**
 * Safe wrapper for Laravel Echo React hooks.
 *
 * Since the vite-plus/Rolldown bundler on some servers fails to resolve
 * `@laravel/echo-react`, this module provides no-op fallbacks so the app
 * loads correctly even when Echo is unavailable.
 *
 * Chat functionality still works via regular HTTP requests; only real-time
 * push notifications are disabled when Echo is not available.
 */

/**
 * Configure Echo with the given broadcaster.
 * This is a no-op – Echo is not available on this server.
 */
export function configureEcho(_options: { broadcaster: string }): void {
    // No-op: Echo package could not be resolved by the bundler.
}

/**
 * React hook that listens for Echo events on a channel.
 * This is a no-op – Echo is not available on this server.
 *
 * Chat messages are still sent/received via regular HTTP requests.
 */
export function useEcho(
    _channel: string,
    _event: string,
    _callback: (payload: unknown) => void,
    _deps: unknown[],
): void {
    // No-op: Echo package could not be resolved by the bundler.
}

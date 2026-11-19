import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ConnectionBadgePingController::__invoke
 * @see app/Http/Controllers/ConnectionBadgePingController.php:11
 * @route '/_connection-badge/ping'
 */
export const ping = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ping.url(options),
    method: 'get',
})

ping.definition = {
    methods: ["get","head"],
    url: '/_connection-badge/ping',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConnectionBadgePingController::__invoke
 * @see app/Http/Controllers/ConnectionBadgePingController.php:11
 * @route '/_connection-badge/ping'
 */
ping.url = (options?: RouteQueryOptions) => {
    return ping.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionBadgePingController::__invoke
 * @see app/Http/Controllers/ConnectionBadgePingController.php:11
 * @route '/_connection-badge/ping'
 */
ping.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ping.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConnectionBadgePingController::__invoke
 * @see app/Http/Controllers/ConnectionBadgePingController.php:11
 * @route '/_connection-badge/ping'
 */
ping.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ping.url(options),
    method: 'head',
})
const connectionBadge = {
    ping: Object.assign(ping, ping),
}

export default connectionBadge
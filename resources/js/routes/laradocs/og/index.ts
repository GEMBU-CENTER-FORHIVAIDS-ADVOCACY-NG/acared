import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/og',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
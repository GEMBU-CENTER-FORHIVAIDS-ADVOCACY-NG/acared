import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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

    /**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
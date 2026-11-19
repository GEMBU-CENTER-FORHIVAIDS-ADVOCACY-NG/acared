import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
export const tree = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tree.url(options),
    method: 'get',
})

tree.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/api/tree',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
tree.url = (options?: RouteQueryOptions) => {
    return tree.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
tree.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tree.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
tree.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tree.url(options),
    method: 'head',
})

    /**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
    const treeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: tree.url(options),
        method: 'get',
    })

            /**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
        treeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tree.url(options),
            method: 'get',
        })
            /**
* @see \Laradocs\Http\Controllers\ApiTreeController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiTreeController.php:18
 * @route '/docs/_laradocs/api/tree'
 */
        treeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tree.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    tree.form = treeForm
/**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/api/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

    /**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
    const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: search.url(options),
        method: 'get',
    })

            /**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
        searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: search.url(options),
            method: 'get',
        })
            /**
* @see \Laradocs\Http\Controllers\ApiSearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiSearchController.php:22
 * @route '/docs/_laradocs/api/search'
 */
        searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: search.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    search.form = searchForm
/**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
export const versions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(options),
    method: 'get',
})

versions.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/api/versions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
versions.url = (options?: RouteQueryOptions) => {
    return versions.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
versions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
versions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions.url(options),
    method: 'head',
})

    /**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
    const versionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: versions.url(options),
        method: 'get',
    })

            /**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
        versionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: versions.url(options),
            method: 'get',
        })
            /**
* @see \Laradocs\Http\Controllers\ApiVersionsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/ApiVersionsController.php:25
 * @route '/docs/_laradocs/api/versions'
 */
        versionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: versions.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    versions.form = versionsForm
const api = {
    tree: Object.assign(tree, tree),
search: Object.assign(search, search),
versions: Object.assign(versions, versions),
}

export default api
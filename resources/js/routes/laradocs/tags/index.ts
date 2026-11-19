import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \Laradocs\Http\Controllers\TagController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:36
 * @route '/docs/tags'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/docs/tags',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\TagController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:36
 * @route '/docs/tags'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\TagController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:36
 * @route '/docs/tags'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\TagController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:36
 * @route '/docs/tags'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\TagController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:59
 * @route '/docs/tag/{tag}'
 */
export const show = (args: { tag: string | number } | [tag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/docs/tag/{tag}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\TagController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:59
 * @route '/docs/tag/{tag}'
 */
show.url = (args: { tag: string | number } | [tag: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tag: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    tag: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        tag: args.tag,
                }

    return show.definition.url
            .replace('{tag}', parsedArgs.tag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\TagController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:59
 * @route '/docs/tag/{tag}'
 */
show.get = (args: { tag: string | number } | [tag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\TagController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/TagController.php:59
 * @route '/docs/tag/{tag}'
 */
show.head = (args: { tag: string | number } | [tag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})
const tags = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
}

export default tags
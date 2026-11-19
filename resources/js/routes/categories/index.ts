import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CategoryController::index
 * @see app/Http/Controllers/CategoryController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CategoryController::index
 * @see app/Http/Controllers/CategoryController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
index.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { current_team: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args?.current_team ?? '$currentTeam',
                }

    return index.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CategoryController::index
 * @see app/Http/Controllers/CategoryController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CategoryController::index
 * @see app/Http/Controllers/CategoryController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CategoryController::store
 * @see app/Http/Controllers/CategoryController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CategoryController::store
 * @see app/Http/Controllers/CategoryController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
store.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { current_team: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args?.current_team ?? '$currentTeam',
                }

    return store.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CategoryController::store
 * @see app/Http/Controllers/CategoryController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CategoryController::update
 * @see app/Http/Controllers/CategoryController.php:69
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories/{category}'
 */
export const update = (args: { current_team?: string | number, category: number | { id: number } } | [current_team: string | number, category: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/categories/{category}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CategoryController::update
 * @see app/Http/Controllers/CategoryController.php:69
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories/{category}'
 */
update.url = (args: { current_team?: string | number, category: number | { id: number } } | [current_team: string | number, category: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    category: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                category: typeof args.category === 'object'
                ? args.category.id
                : args.category,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CategoryController::update
 * @see app/Http/Controllers/CategoryController.php:69
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories/{category}'
 */
update.patch = (args: { current_team?: string | number, category: number | { id: number } } | [current_team: string | number, category: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\CategoryController::destroy
 * @see app/Http/Controllers/CategoryController.php:81
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories/{category}'
 */
export const destroy = (args: { current_team?: string | number, category: number | { id: number } } | [current_team: string | number, category: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/categories/{category}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CategoryController::destroy
 * @see app/Http/Controllers/CategoryController.php:81
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories/{category}'
 */
destroy.url = (args: { current_team?: string | number, category: number | { id: number } } | [current_team: string | number, category: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    category: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                category: typeof args.category === 'object'
                ? args.category.id
                : args.category,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CategoryController::destroy
 * @see app/Http/Controllers/CategoryController.php:81
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/categories/{category}'
 */
destroy.delete = (args: { current_team?: string | number, category: number | { id: number } } | [current_team: string | number, category: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const categories = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default categories
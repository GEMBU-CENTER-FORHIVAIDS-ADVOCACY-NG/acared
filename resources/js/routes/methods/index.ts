import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\Settings\MethodController::index
* @see app/Http/Controllers/Settings/MethodController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
*/
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/methods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\MethodController::index
* @see app/Http/Controllers/Settings/MethodController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
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
* @see \App\Http\Controllers\Settings\MethodController::index
* @see app/Http/Controllers/Settings/MethodController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
*/
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\MethodController::index
* @see app/Http/Controllers/Settings/MethodController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
*/
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\MethodController::store
* @see app/Http/Controllers/Settings/MethodController.php:40
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
*/
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/methods',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\MethodController::store
* @see app/Http/Controllers/Settings/MethodController.php:40
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
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
* @see \App\Http\Controllers\Settings\MethodController::store
* @see app/Http/Controllers/Settings/MethodController.php:40
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods'
*/
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\MethodController::update
* @see app/Http/Controllers/Settings/MethodController.php:51
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods/{method}'
*/
export const update = (args: { current_team?: string | number, method: number | { id: number } } | [current_team: string | number, method: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/methods/{method}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\MethodController::update
* @see app/Http/Controllers/Settings/MethodController.php:51
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods/{method}'
*/
update.url = (args: { current_team?: string | number, method: number | { id: number } } | [current_team: string | number, method: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            method: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        method: typeof args.method === 'object'
        ? args.method.id
        : args.method,
    }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{method}', parsedArgs.method.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\MethodController::update
* @see app/Http/Controllers/Settings/MethodController.php:51
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods/{method}'
*/
update.patch = (args: { current_team?: string | number, method: number | { id: number } } | [current_team: string | number, method: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\MethodController::destroy
* @see app/Http/Controllers/Settings/MethodController.php:58
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods/{method}'
*/
export const destroy = (args: { current_team?: string | number, method: number | { id: number } } | [current_team: string | number, method: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/methods/{method}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\MethodController::destroy
* @see app/Http/Controllers/Settings/MethodController.php:58
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods/{method}'
*/
destroy.url = (args: { current_team?: string | number, method: number | { id: number } } | [current_team: string | number, method: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            method: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        method: typeof args.method === 'object'
        ? args.method.id
        : args.method,
    }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{method}', parsedArgs.method.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\MethodController::destroy
* @see app/Http/Controllers/Settings/MethodController.php:58
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/methods/{method}'
*/
destroy.delete = (args: { current_team?: string | number, method: number | { id: number } } | [current_team: string | number, method: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const methods = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    bulk: Object.assign(bulk, bulk),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default methods
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\VendorController::index
 * @see app/Http/Controllers/VendorController.php:14
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/vendors',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VendorController::index
 * @see app/Http/Controllers/VendorController.php:14
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
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
* @see \App\Http\Controllers\VendorController::index
 * @see app/Http/Controllers/VendorController.php:14
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VendorController::index
 * @see app/Http/Controllers/VendorController.php:14
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\VendorController::store
 * @see app/Http/Controllers/VendorController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/vendors',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VendorController::store
 * @see app/Http/Controllers/VendorController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
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
* @see \App\Http\Controllers\VendorController::store
 * @see app/Http/Controllers/VendorController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VendorController::update
 * @see app/Http/Controllers/VendorController.php:60
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors/{vendor}'
 */
export const update = (args: { current_team?: string | number, vendor: number | { id: number } } | [current_team: string | number, vendor: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/vendors/{vendor}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\VendorController::update
 * @see app/Http/Controllers/VendorController.php:60
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors/{vendor}'
 */
update.url = (args: { current_team?: string | number, vendor: number | { id: number } } | [current_team: string | number, vendor: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    vendor: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                vendor: typeof args.vendor === 'object'
                ? args.vendor.id
                : args.vendor,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{vendor}', parsedArgs.vendor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VendorController::update
 * @see app/Http/Controllers/VendorController.php:60
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors/{vendor}'
 */
update.patch = (args: { current_team?: string | number, vendor: number | { id: number } } | [current_team: string | number, vendor: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\VendorController::destroy
 * @see app/Http/Controllers/VendorController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors/{vendor}'
 */
export const destroy = (args: { current_team?: string | number, vendor: number | { id: number } } | [current_team: string | number, vendor: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/vendors/{vendor}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VendorController::destroy
 * @see app/Http/Controllers/VendorController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors/{vendor}'
 */
destroy.url = (args: { current_team?: string | number, vendor: number | { id: number } } | [current_team: string | number, vendor: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    vendor: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                vendor: typeof args.vendor === 'object'
                ? args.vendor.id
                : args.vendor,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{vendor}', parsedArgs.vendor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VendorController::destroy
 * @see app/Http/Controllers/VendorController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/vendors/{vendor}'
 */
destroy.delete = (args: { current_team?: string | number, vendor: number | { id: number } } | [current_team: string | number, vendor: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const vendors = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default vendors
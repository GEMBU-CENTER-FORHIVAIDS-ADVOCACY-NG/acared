import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import patients from './patients'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\BillingController::index
 * @see app/Http/Controllers/BillingController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/billings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::index
 * @see app/Http/Controllers/BillingController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
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
* @see \App\Http\Controllers\BillingController::index
 * @see app/Http/Controllers/BillingController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BillingController::index
 * @see app/Http/Controllers/BillingController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BillingController::history
 * @see app/Http/Controllers/BillingController.php:227
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/history'
 */
export const history = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/billings/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::history
 * @see app/Http/Controllers/BillingController.php:227
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/history'
 */
history.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return history.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::history
 * @see app/Http/Controllers/BillingController.php:227
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/history'
 */
history.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BillingController::history
 * @see app/Http/Controllers/BillingController.php:227
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/history'
 */
history.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BillingController::store
 * @see app/Http/Controllers/BillingController.php:365
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/billings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingController::store
 * @see app/Http/Controllers/BillingController.php:365
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
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
* @see \App\Http\Controllers\BillingController::store
 * @see app/Http/Controllers/BillingController.php:365
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::newMethod
 * @see app/Http/Controllers/BillingController.php:280
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/new'
 */
export const newMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: newMethod.url(args, options),
    method: 'post',
})

newMethod.definition = {
    methods: ["post"],
    url: '/{current_team?}/billings/new',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingController::newMethod
 * @see app/Http/Controllers/BillingController.php:280
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/new'
 */
newMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return newMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::newMethod
 * @see app/Http/Controllers/BillingController.php:280
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/new'
 */
newMethod.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: newMethod.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::show
 * @see app/Http/Controllers/BillingController.php:267
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
export const show = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/billings/{billing}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::show
 * @see app/Http/Controllers/BillingController.php:267
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
show.url = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    billing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                billing: typeof args.billing === 'object'
                ? args.billing.id
                : args.billing,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{billing}', parsedArgs.billing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::show
 * @see app/Http/Controllers/BillingController.php:267
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
show.get = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BillingController::show
 * @see app/Http/Controllers/BillingController.php:267
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
show.head = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BillingController::destroy
 * @see app/Http/Controllers/BillingController.php:502
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
export const destroy = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/billings/{billing}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BillingController::destroy
 * @see app/Http/Controllers/BillingController.php:502
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
destroy.url = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    billing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                billing: typeof args.billing === 'object'
                ? args.billing.id
                : args.billing,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{billing}', parsedArgs.billing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::destroy
 * @see app/Http/Controllers/BillingController.php:502
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/{billing}'
 */
destroy.delete = (args: { current_team?: string | number, billing: number | { id: number } } | [current_team: string | number, billing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const billings = {
    patients: Object.assign(patients, patients),
index: Object.assign(index, index),
history: Object.assign(history, history),
store: Object.assign(store, store),
new: Object.assign(newMethod, newMethod),
bulk: Object.assign(bulk, bulk),
show: Object.assign(show, show),
destroy: Object.assign(destroy, destroy),
}

export default billings
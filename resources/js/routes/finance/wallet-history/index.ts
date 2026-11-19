import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import patients from './patients'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\WalletHistoryController::index
 * @see app/Http/Controllers/WalletHistoryController.php:25
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/finance/wallet-history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WalletHistoryController::index
 * @see app/Http/Controllers/WalletHistoryController.php:25
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
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
* @see \App\Http\Controllers\WalletHistoryController::index
 * @see app/Http/Controllers/WalletHistoryController.php:25
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WalletHistoryController::index
 * @see app/Http/Controllers/WalletHistoryController.php:25
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WalletHistoryController::show
 * @see app/Http/Controllers/WalletHistoryController.php:297
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
export const show = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/finance/wallet-history/{wallet_history}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WalletHistoryController::show
 * @see app/Http/Controllers/WalletHistoryController.php:297
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
show.url = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    wallet_history: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                wallet_history: typeof args.wallet_history === 'object'
                ? args.wallet_history.id
                : args.wallet_history,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{wallet_history}', parsedArgs.wallet_history.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletHistoryController::show
 * @see app/Http/Controllers/WalletHistoryController.php:297
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
show.get = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WalletHistoryController::show
 * @see app/Http/Controllers/WalletHistoryController.php:297
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
show.head = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WalletHistoryController::store
 * @see app/Http/Controllers/WalletHistoryController.php:159
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/finance/wallet-history',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WalletHistoryController::store
 * @see app/Http/Controllers/WalletHistoryController.php:159
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
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
* @see \App\Http\Controllers\WalletHistoryController::store
 * @see app/Http/Controllers/WalletHistoryController.php:159
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletHistoryController::transfer
 * @see app/Http/Controllers/WalletHistoryController.php:341
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/transfer'
 */
export const transfer = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(args, options),
    method: 'post',
})

transfer.definition = {
    methods: ["post"],
    url: '/{current_team?}/finance/wallet-history/transfer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WalletHistoryController::transfer
 * @see app/Http/Controllers/WalletHistoryController.php:341
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/transfer'
 */
transfer.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return transfer.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletHistoryController::transfer
 * @see app/Http/Controllers/WalletHistoryController.php:341
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/transfer'
 */
transfer.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletHistoryController::update
 * @see app/Http/Controllers/WalletHistoryController.php:311
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
export const update = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/finance/wallet-history/{wallet_history}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\WalletHistoryController::update
 * @see app/Http/Controllers/WalletHistoryController.php:311
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
update.url = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    wallet_history: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                wallet_history: typeof args.wallet_history === 'object'
                ? args.wallet_history.id
                : args.wallet_history,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{wallet_history}', parsedArgs.wallet_history.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletHistoryController::update
 * @see app/Http/Controllers/WalletHistoryController.php:311
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
update.patch = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\WalletHistoryController::destroy
 * @see app/Http/Controllers/WalletHistoryController.php:304
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
export const destroy = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/finance/wallet-history/{wallet_history}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WalletHistoryController::destroy
 * @see app/Http/Controllers/WalletHistoryController.php:304
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
destroy.url = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    wallet_history: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                wallet_history: typeof args.wallet_history === 'object'
                ? args.wallet_history.id
                : args.wallet_history,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{wallet_history}', parsedArgs.wallet_history.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletHistoryController::destroy
 * @see app/Http/Controllers/WalletHistoryController.php:304
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/finance/wallet-history/{wallet_history}'
 */
destroy.delete = (args: { current_team?: string | number, wallet_history: number | { id: number } } | [current_team: string | number, wallet_history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const walletHistory = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
patients: Object.assign(patients, patients),
store: Object.assign(store, store),
transfer: Object.assign(transfer, transfer),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default walletHistory
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\PurchaseOrderController::index
* @see app/Http/Controllers/PurchaseOrderController.php:22
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
*/
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/purchase-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PurchaseOrderController::index
* @see app/Http/Controllers/PurchaseOrderController.php:22
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
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
* @see \App\Http\Controllers\PurchaseOrderController::index
* @see app/Http/Controllers/PurchaseOrderController.php:22
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
*/
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PurchaseOrderController::index
* @see app/Http/Controllers/PurchaseOrderController.php:22
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
*/
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PurchaseOrderController::store
* @see app/Http/Controllers/PurchaseOrderController.php:97
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
*/
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/purchase-orders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PurchaseOrderController::store
* @see app/Http/Controllers/PurchaseOrderController.php:97
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
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
* @see \App\Http\Controllers\PurchaseOrderController::store
* @see app/Http/Controllers/PurchaseOrderController.php:97
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders'
*/
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PurchaseOrderController::approve
* @see app/Http/Controllers/PurchaseOrderController.php:189
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}/approve'
*/
export const approve = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: approve.url(args, options),
    method: 'patch',
})

approve.definition = {
    methods: ["patch"],
    url: '/{current_team?}/purchase-orders/{purchaseOrder}/approve',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PurchaseOrderController::approve
* @see app/Http/Controllers/PurchaseOrderController.php:189
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}/approve'
*/
approve.url = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            purchaseOrder: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        purchaseOrder: typeof args.purchaseOrder === 'object'
        ? args.purchaseOrder.id
        : args.purchaseOrder,
    }

    return approve.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{purchaseOrder}', parsedArgs.purchaseOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PurchaseOrderController::approve
* @see app/Http/Controllers/PurchaseOrderController.php:189
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}/approve'
*/
approve.patch = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: approve.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PurchaseOrderController::postInventory
* @see app/Http/Controllers/PurchaseOrderController.php:198
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}/post-inventory'
*/
export const postInventory = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: postInventory.url(args, options),
    method: 'post',
})

postInventory.definition = {
    methods: ["post"],
    url: '/{current_team?}/purchase-orders/{purchaseOrder}/post-inventory',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PurchaseOrderController::postInventory
* @see app/Http/Controllers/PurchaseOrderController.php:198
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}/post-inventory'
*/
postInventory.url = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            purchaseOrder: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        purchaseOrder: typeof args.purchaseOrder === 'object'
        ? args.purchaseOrder.id
        : args.purchaseOrder,
    }

    return postInventory.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{purchaseOrder}', parsedArgs.purchaseOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PurchaseOrderController::postInventory
* @see app/Http/Controllers/PurchaseOrderController.php:198
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}/post-inventory'
*/
postInventory.post = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: postInventory.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PurchaseOrderController::update
* @see app/Http/Controllers/PurchaseOrderController.php:135
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}'
*/
export const update = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/purchase-orders/{purchaseOrder}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PurchaseOrderController::update
* @see app/Http/Controllers/PurchaseOrderController.php:135
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}'
*/
update.url = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            purchaseOrder: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        purchaseOrder: typeof args.purchaseOrder === 'object'
        ? args.purchaseOrder.id
        : args.purchaseOrder,
    }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{purchaseOrder}', parsedArgs.purchaseOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PurchaseOrderController::update
* @see app/Http/Controllers/PurchaseOrderController.php:135
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}'
*/
update.patch = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PurchaseOrderController::destroy
* @see app/Http/Controllers/PurchaseOrderController.php:170
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}'
*/
export const destroy = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/purchase-orders/{purchaseOrder}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PurchaseOrderController::destroy
* @see app/Http/Controllers/PurchaseOrderController.php:170
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}'
*/
destroy.url = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            purchaseOrder: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        purchaseOrder: typeof args.purchaseOrder === 'object'
        ? args.purchaseOrder.id
        : args.purchaseOrder,
    }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{purchaseOrder}', parsedArgs.purchaseOrder.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PurchaseOrderController::destroy
* @see app/Http/Controllers/PurchaseOrderController.php:170
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/purchase-orders/{purchaseOrder}'
*/
destroy.delete = (args: { current_team?: string | number, purchaseOrder: number | { id: number } } | [current_team: string | number, purchaseOrder: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const purchaseOrders = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    bulk: Object.assign(bulk, bulk),
    approve: Object.assign(approve, approve),
    postInventory: Object.assign(postInventory, postInventory),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default purchaseOrders
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\InventoryController::index
* @see app/Http/Controllers/InventoryController.php:112
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
*/
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/inventory/stock',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryController::index
* @see app/Http/Controllers/InventoryController.php:112
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
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
* @see \App\Http\Controllers\InventoryController::index
* @see app/Http/Controllers/InventoryController.php:112
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
*/
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryController::index
* @see app/Http/Controllers/InventoryController.php:112
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
*/
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryController::exportMethod
* @see app/Http/Controllers/InventoryController.php:25
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export'
*/
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/inventory/stock/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryController::exportMethod
* @see app/Http/Controllers/InventoryController.php:25
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export'
*/
exportMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::exportMethod
* @see app/Http/Controllers/InventoryController.php:25
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export'
*/
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryController::exportMethod
* @see app/Http/Controllers/InventoryController.php:25
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export'
*/
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryController::exportStockTaking
* @see app/Http/Controllers/InventoryController.php:64
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export-stock-taking'
*/
export const exportStockTaking = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportStockTaking.url(args, options),
    method: 'get',
})

exportStockTaking.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/inventory/stock/export-stock-taking',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryController::exportStockTaking
* @see app/Http/Controllers/InventoryController.php:64
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export-stock-taking'
*/
exportStockTaking.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportStockTaking.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::exportStockTaking
* @see app/Http/Controllers/InventoryController.php:64
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export-stock-taking'
*/
exportStockTaking.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportStockTaking.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryController::exportStockTaking
* @see app/Http/Controllers/InventoryController.php:64
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/export-stock-taking'
*/
exportStockTaking.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportStockTaking.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryController::print
* @see app/Http/Controllers/InventoryController.php:96
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/print'
*/
export const print = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: print.url(args, options),
    method: 'get',
})

print.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/inventory/stock/print',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryController::print
* @see app/Http/Controllers/InventoryController.php:96
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/print'
*/
print.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return print.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::print
* @see app/Http/Controllers/InventoryController.php:96
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/print'
*/
print.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: print.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryController::print
* @see app/Http/Controllers/InventoryController.php:96
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/print'
*/
print.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: print.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryImportController::importMethod
* @see app/Http/Controllers/InventoryImportController.php:61
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/import'
*/
export const importMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/{current_team?}/inventory/stock/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InventoryImportController::importMethod
* @see app/Http/Controllers/InventoryImportController.php:61
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/import'
*/
importMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return importMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryImportController::importMethod
* @see app/Http/Controllers/InventoryImportController.php:61
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/import'
*/
importMethod.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InventoryController::store
* @see app/Http/Controllers/InventoryController.php:211
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
*/
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/inventory/stock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InventoryController::store
* @see app/Http/Controllers/InventoryController.php:211
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
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
* @see \App\Http\Controllers\InventoryController::store
* @see app/Http/Controllers/InventoryController.php:211
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock'
*/
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InventoryController::adjust
* @see app/Http/Controllers/InventoryController.php:270
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/adjust'
*/
export const adjust = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

adjust.definition = {
    methods: ["post"],
    url: '/{current_team?}/inventory/stock/adjust',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InventoryController::adjust
* @see app/Http/Controllers/InventoryController.php:270
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/adjust'
*/
adjust.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return adjust.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::adjust
* @see app/Http/Controllers/InventoryController.php:270
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/adjust'
*/
adjust.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InventoryController::transfer
* @see app/Http/Controllers/InventoryController.php:329
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/transfer'
*/
export const transfer = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(args, options),
    method: 'post',
})

transfer.definition = {
    methods: ["post"],
    url: '/{current_team?}/inventory/stock/transfer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InventoryController::transfer
* @see app/Http/Controllers/InventoryController.php:329
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/transfer'
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
* @see \App\Http\Controllers\InventoryController::transfer
* @see app/Http/Controllers/InventoryController.php:329
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/transfer'
*/
transfer.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InventoryController::show
* @see app/Http/Controllers/InventoryController.php:186
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
export const show = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/inventory/stock/{inventory}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryController::show
* @see app/Http/Controllers/InventoryController.php:186
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
show.url = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            inventory: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        inventory: typeof args.inventory === 'object'
        ? args.inventory.id
        : args.inventory,
    }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::show
* @see app/Http/Controllers/InventoryController.php:186
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
show.get = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryController::show
* @see app/Http/Controllers/InventoryController.php:186
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
show.head = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryController::update
* @see app/Http/Controllers/InventoryController.php:228
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
export const update = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/inventory/stock/{inventory}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\InventoryController::update
* @see app/Http/Controllers/InventoryController.php:228
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
update.url = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            inventory: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        inventory: typeof args.inventory === 'object'
        ? args.inventory.id
        : args.inventory,
    }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::update
* @see app/Http/Controllers/InventoryController.php:228
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
update.patch = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\InventoryController::destroy
* @see app/Http/Controllers/InventoryController.php:244
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
export const destroy = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/inventory/stock/{inventory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\InventoryController::destroy
* @see app/Http/Controllers/InventoryController.php:244
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
destroy.url = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            inventory: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        inventory: typeof args.inventory === 'object'
        ? args.inventory.id
        : args.inventory,
    }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryController::destroy
* @see app/Http/Controllers/InventoryController.php:244
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/inventory/stock/{inventory}'
*/
destroy.delete = (args: { current_team?: string | number, inventory: number | { id: number } } | [current_team: string | number, inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const stock = {
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
    exportStockTaking: Object.assign(exportStockTaking, exportStockTaking),
    print: Object.assign(print, print),
    import: Object.assign(importMethod, importMethod),
    store: Object.assign(store, store),
    adjust: Object.assign(adjust, adjust),
    transfer: Object.assign(transfer, transfer),
    bulk: Object.assign(bulk, bulk),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default stock
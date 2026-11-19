import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::index
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:74
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/inventories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::index
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:74
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
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
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::index
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:74
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::index
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:74
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::exportMethod
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:35
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/export'
 */
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/inventories/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::exportMethod
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:35
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/export'
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
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::exportMethod
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:35
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/export'
 */
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::exportMethod
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:35
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/export'
 */
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugCatalogImportController::importMethod
 * @see app/Http/Controllers/Pharmacy/DrugCatalogImportController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/import'
 */
export const importMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/inventories/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugCatalogImportController::importMethod
 * @see app/Http/Controllers/Pharmacy/DrugCatalogImportController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/import'
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
* @see \App\Http\Controllers\Pharmacy\DrugCatalogImportController::importMethod
 * @see app/Http/Controllers/Pharmacy/DrugCatalogImportController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/import'
 */
importMethod.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::store
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:197
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/inventories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::store
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:197
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
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
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::store
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:197
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::adjust
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:283
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/adjust'
 */
export const adjust = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

adjust.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/inventories/adjust',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::adjust
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:283
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/adjust'
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
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::adjust
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:283
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/adjust'
 */
adjust.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::show
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:148
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
export const show = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/inventories/{drug_inventory}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::show
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:148
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
show.url = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    drug_inventory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                drug_inventory: typeof args.drug_inventory === 'object'
                ? args.drug_inventory.id
                : args.drug_inventory,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{drug_inventory}', parsedArgs.drug_inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::show
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:148
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
show.get = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::show
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:148
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
show.head = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::edit
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:177
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}/edit'
 */
export const edit = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/inventories/{drug_inventory}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::edit
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:177
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}/edit'
 */
edit.url = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    drug_inventory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                drug_inventory: typeof args.drug_inventory === 'object'
                ? args.drug_inventory.id
                : args.drug_inventory,
                }

    return edit.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{drug_inventory}', parsedArgs.drug_inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::edit
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:177
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}/edit'
 */
edit.get = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::edit
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:177
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}/edit'
 */
edit.head = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::update
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:217
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
export const update = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/pharmacy/inventories/{drug_inventory}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::update
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:217
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
update.url = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    drug_inventory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                drug_inventory: typeof args.drug_inventory === 'object'
                ? args.drug_inventory.id
                : args.drug_inventory,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{drug_inventory}', parsedArgs.drug_inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::update
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:217
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
update.patch = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::destroy
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:236
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
export const destroy = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/pharmacy/inventories/{drug_inventory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::destroy
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:236
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
destroy.url = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    drug_inventory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                drug_inventory: typeof args.drug_inventory === 'object'
                ? args.drug_inventory.id
                : args.drug_inventory,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{drug_inventory}', parsedArgs.drug_inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\DrugInventoryController::destroy
 * @see app/Http/Controllers/Pharmacy/DrugInventoryController.php:236
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/inventories/{drug_inventory}'
 */
destroy.delete = (args: { current_team?: string | number, drug_inventory: number | { id: number } } | [current_team: string | number, drug_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const inventories = {
    index: Object.assign(index, index),
export: Object.assign(exportMethod, exportMethod),
import: Object.assign(importMethod, importMethod),
store: Object.assign(store, store),
adjust: Object.assign(adjust, adjust),
bulk: Object.assign(bulk, bulk),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default inventories
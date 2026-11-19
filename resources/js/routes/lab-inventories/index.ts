import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import drugForms from './drug-forms'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/lab-inventories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
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
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LabInventoryController::index
 * @see app/Http/Controllers/LabInventoryController.php:37
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
        indexForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:85
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/lab-inventories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:85
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
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
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:85
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:85
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:85
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LabInventoryController::adjust
 * @see app/Http/Controllers/LabInventoryController.php:153
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/adjust'
 */
export const adjust = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

adjust.definition = {
    methods: ["post"],
    url: '/{current_team?}/lab-inventories/adjust',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LabInventoryController::adjust
 * @see app/Http/Controllers/LabInventoryController.php:153
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/adjust'
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
* @see \App\Http\Controllers\LabInventoryController::adjust
 * @see app/Http/Controllers/LabInventoryController.php:153
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/adjust'
 */
adjust.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LabInventoryController::adjust
 * @see app/Http/Controllers/LabInventoryController.php:153
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/adjust'
 */
    const adjustForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: adjust.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabInventoryController::adjust
 * @see app/Http/Controllers/LabInventoryController.php:153
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/adjust'
 */
        adjustForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: adjust.url(args, options),
            method: 'post',
        })
    
    adjust.form = adjustForm
/**
* @see \App\Http\Controllers\LabInventoryController::update
 * @see app/Http/Controllers/LabInventoryController.php:104
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
export const update = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/lab-inventories/{lab_inventory}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\LabInventoryController::update
 * @see app/Http/Controllers/LabInventoryController.php:104
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
update.url = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    lab_inventory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                lab_inventory: typeof args.lab_inventory === 'object'
                ? args.lab_inventory.id
                : args.lab_inventory,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{lab_inventory}', parsedArgs.lab_inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabInventoryController::update
 * @see app/Http/Controllers/LabInventoryController.php:104
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
update.patch = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\LabInventoryController::update
 * @see app/Http/Controllers/LabInventoryController.php:104
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
    const updateForm = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabInventoryController::update
 * @see app/Http/Controllers/LabInventoryController.php:104
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
        updateForm.patch = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\LabInventoryController::destroy
 * @see app/Http/Controllers/LabInventoryController.php:124
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
export const destroy = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/lab-inventories/{lab_inventory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LabInventoryController::destroy
 * @see app/Http/Controllers/LabInventoryController.php:124
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
destroy.url = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    lab_inventory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                lab_inventory: typeof args.lab_inventory === 'object'
                ? args.lab_inventory.id
                : args.lab_inventory,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{lab_inventory}', parsedArgs.lab_inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabInventoryController::destroy
 * @see app/Http/Controllers/LabInventoryController.php:124
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
destroy.delete = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LabInventoryController::destroy
 * @see app/Http/Controllers/LabInventoryController.php:124
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
    const destroyForm = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabInventoryController::destroy
 * @see app/Http/Controllers/LabInventoryController.php:124
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/{lab_inventory}'
 */
        destroyForm.delete = (args: { current_team?: string | number, lab_inventory: number | { id: number } } | [current_team: string | number, lab_inventory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const labInventories = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
adjust: Object.assign(adjust, adjust),
drugForms: Object.assign(drugForms, drugForms),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default labInventories
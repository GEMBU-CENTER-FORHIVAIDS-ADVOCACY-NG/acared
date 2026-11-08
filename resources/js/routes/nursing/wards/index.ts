import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/wards',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
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
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WardController::index
 * @see app/Http/Controllers/WardController.php:19
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
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
* @see \App\Http\Controllers\WardController::store
 * @see app/Http/Controllers/WardController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/nursing/wards',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WardController::store
 * @see app/Http/Controllers/WardController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
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
* @see \App\Http\Controllers\WardController::store
 * @see app/Http/Controllers/WardController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WardController::store
 * @see app/Http/Controllers/WardController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WardController::store
 * @see app/Http/Controllers/WardController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\WardController::restore
 * @see app/Http/Controllers/WardController.php:126
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/restore'
 */
export const restore = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: restore.url(args, options),
    method: 'patch',
})

restore.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/wards/{ward}/restore',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\WardController::restore
 * @see app/Http/Controllers/WardController.php:126
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/restore'
 */
restore.url = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    ward: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                ward: args.ward,
                }

    return restore.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{ward}', parsedArgs.ward.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WardController::restore
 * @see app/Http/Controllers/WardController.php:126
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/restore'
 */
restore.patch = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: restore.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\WardController::restore
 * @see app/Http/Controllers/WardController.php:126
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/restore'
 */
    const restoreForm = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WardController::restore
 * @see app/Http/Controllers/WardController.php:126
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/restore'
 */
        restoreForm.patch = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    restore.form = restoreForm
/**
* @see \App\Http\Controllers\WardController::forceDestroy
 * @see app/Http/Controllers/WardController.php:133
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/force'
 */
export const forceDestroy = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDestroy.url(args, options),
    method: 'delete',
})

forceDestroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/wards/{ward}/force',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WardController::forceDestroy
 * @see app/Http/Controllers/WardController.php:133
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/force'
 */
forceDestroy.url = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    ward: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                ward: args.ward,
                }

    return forceDestroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{ward}', parsedArgs.ward.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WardController::forceDestroy
 * @see app/Http/Controllers/WardController.php:133
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/force'
 */
forceDestroy.delete = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDestroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WardController::forceDestroy
 * @see app/Http/Controllers/WardController.php:133
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/force'
 */
    const forceDestroyForm = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forceDestroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WardController::forceDestroy
 * @see app/Http/Controllers/WardController.php:133
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}/force'
 */
        forceDestroyForm.delete = (args: { current_team?: string | number, ward: string | number } | [current_team: string | number, ward: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forceDestroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    forceDestroy.form = forceDestroyForm
/**
* @see \App\Http\Controllers\WardController::update
 * @see app/Http/Controllers/WardController.php:75
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
export const update = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/wards/{ward}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\WardController::update
 * @see app/Http/Controllers/WardController.php:75
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
update.url = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    ward: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                ward: typeof args.ward === 'object'
                ? args.ward.id
                : args.ward,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{ward}', parsedArgs.ward.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WardController::update
 * @see app/Http/Controllers/WardController.php:75
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
update.patch = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\WardController::update
 * @see app/Http/Controllers/WardController.php:75
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
    const updateForm = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WardController::update
 * @see app/Http/Controllers/WardController.php:75
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
        updateForm.patch = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\WardController::destroy
 * @see app/Http/Controllers/WardController.php:105
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
export const destroy = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/wards/{ward}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WardController::destroy
 * @see app/Http/Controllers/WardController.php:105
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
destroy.url = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    ward: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                ward: typeof args.ward === 'object'
                ? args.ward.id
                : args.ward,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{ward}', parsedArgs.ward.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WardController::destroy
 * @see app/Http/Controllers/WardController.php:105
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
destroy.delete = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WardController::destroy
 * @see app/Http/Controllers/WardController.php:105
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
    const destroyForm = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WardController::destroy
 * @see app/Http/Controllers/WardController.php:105
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/wards/{ward}'
 */
        destroyForm.delete = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const wards = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
restore: Object.assign(restore, restore),
forceDestroy: Object.assign(forceDestroy, forceDestroy),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default wards
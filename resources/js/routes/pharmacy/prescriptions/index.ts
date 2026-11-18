import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import bulk from './bulk'
import patients from './patients'
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/prescriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
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
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::index
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:34
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
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
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
export const create = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/prescriptions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
create.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
create.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
create.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
    const createForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
        createForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::create
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:141
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/create'
 */
        createForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::store
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:164
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/prescriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::store
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:164
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
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
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::store
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:164
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::store
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:164
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::store
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:164
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
export const show = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
show.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
show.get = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
show.head = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
    const showForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
        showForm.get = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::show
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:108
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
        showForm.head = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
export const edit = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
edit.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return edit.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
edit.get = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
edit.head = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
    const editForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
        editForm.get = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::edit
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:123
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/edit'
 */
        editForm.head = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::update
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:249
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
export const update = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::update
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:249
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
update.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::update
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:249
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
update.patch = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::update
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:249
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
    const updateForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::update
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:249
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
        updateForm.patch = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::refund
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:379
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/refund'
 */
export const refund = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refund.url(args, options),
    method: 'post',
})

refund.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}/refund',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::refund
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:379
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/refund'
 */
refund.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return refund.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::refund
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:379
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/refund'
 */
refund.post = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refund.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::refund
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:379
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/refund'
 */
    const refundForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refund.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::refund
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:379
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/refund'
 */
        refundForm.post = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refund.url(args, options),
            method: 'post',
        })
    
    refund.form = refundForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispense
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:475
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense'
 */
export const dispense = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispense.url(args, options),
    method: 'post',
})

dispense.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispense
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:475
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense'
 */
dispense.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return dispense.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispense
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:475
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense'
 */
dispense.post = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispense.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispense
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:475
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense'
 */
    const dispenseForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: dispense.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispense
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:475
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense'
 */
        dispenseForm.post = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: dispense.url(args, options),
            method: 'post',
        })
    
    dispense.form = dispenseForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispenseNewLines
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:534
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense-new-lines'
 */
export const dispenseNewLines = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispenseNewLines.url(args, options),
    method: 'post',
})

dispenseNewLines.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense-new-lines',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispenseNewLines
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:534
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense-new-lines'
 */
dispenseNewLines.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return dispenseNewLines.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispenseNewLines
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:534
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense-new-lines'
 */
dispenseNewLines.post = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispenseNewLines.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispenseNewLines
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:534
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense-new-lines'
 */
    const dispenseNewLinesForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: dispenseNewLines.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::dispenseNewLines
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:534
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}/dispense-new-lines'
 */
        dispenseNewLinesForm.post = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: dispenseNewLines.url(args, options),
            method: 'post',
        })
    
    dispenseNewLines.form = dispenseNewLinesForm
/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::destroy
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:619
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
export const destroy = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/pharmacy/prescriptions/{prescription}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::destroy
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:619
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
destroy.url = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    prescription: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                prescription: typeof args.prescription === 'object'
                ? args.prescription.id
                : args.prescription,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{prescription}', parsedArgs.prescription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::destroy
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:619
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
destroy.delete = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::destroy
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:619
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
    const destroyForm = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Pharmacy\PrescriptionController::destroy
 * @see app/Http/Controllers/Pharmacy/PrescriptionController.php:619
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/prescriptions/{prescription}'
 */
        destroyForm.delete = (args: { current_team?: string | number, prescription: number | { id: number } } | [current_team: string | number, prescription: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const prescriptions = {
    index: Object.assign(index, index),
bulk: Object.assign(bulk, bulk),
create: Object.assign(create, create),
patients: Object.assign(patients, patients),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
refund: Object.assign(refund, refund),
dispense: Object.assign(dispense, dispense),
dispenseNewLines: Object.assign(dispenseNewLines, dispenseNewLines),
destroy: Object.assign(destroy, destroy),
}

export default prescriptions
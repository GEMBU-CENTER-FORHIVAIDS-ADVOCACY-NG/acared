import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import patients from './patients'
import bulk from './bulk'
import showBac614 from './show'
import results from './results'
/**
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/laboratories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
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
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryController::index
 * @see app/Http/Controllers/LaboratoryController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
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
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
 */
export const history = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/laboratories/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
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
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
 */
history.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
 */
history.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
 */
    const historyForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
 */
        historyForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryController::history
 * @see app/Http/Controllers/LaboratoryController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/history'
 */
        historyForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
/**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:264
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/laboratories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:264
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
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
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:264
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:264
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:264
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
export const show = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/laboratories/{laboratory}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
show.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    laboratory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                laboratory: typeof args.laboratory === 'object'
                ? args.laboratory.id
                : args.laboratory,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
show.get = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
show.head = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
    const showForm = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
        showForm.get = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryController::show
 * @see app/Http/Controllers/LaboratoryController.php:200
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
        showForm.head = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
export const print = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: print.url(args, options),
    method: 'get',
})

print.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/laboratories/{laboratory}/print',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
print.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    laboratory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                laboratory: typeof args.laboratory === 'object'
                ? args.laboratory.id
                : args.laboratory,
                }

    return print.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
print.get = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: print.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
print.head = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: print.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
    const printForm = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: print.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
        printForm.get = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: print.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryController::print
 * @see app/Http/Controllers/LaboratoryController.php:239
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/print'
 */
        printForm.head = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: print.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    print.form = printForm
/**
* @see \App\Http\Controllers\LaboratoryController::cancel
 * @see app/Http/Controllers/LaboratoryController.php:377
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/cancel'
 */
export const cancel = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/{current_team?}/laboratories/{laboratory}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LaboratoryController::cancel
 * @see app/Http/Controllers/LaboratoryController.php:377
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/cancel'
 */
cancel.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    laboratory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                laboratory: typeof args.laboratory === 'object'
                ? args.laboratory.id
                : args.laboratory,
                }

    return cancel.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::cancel
 * @see app/Http/Controllers/LaboratoryController.php:377
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/cancel'
 */
cancel.post = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::cancel
 * @see app/Http/Controllers/LaboratoryController.php:377
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/cancel'
 */
    const cancelForm = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::cancel
 * @see app/Http/Controllers/LaboratoryController.php:377
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/cancel'
 */
        cancelForm.post = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:471
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
export const destroy = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/laboratories/{laboratory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:471
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
destroy.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    laboratory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                laboratory: typeof args.laboratory === 'object'
                ? args.laboratory.id
                : args.laboratory,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:471
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
destroy.delete = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:471
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
    const destroyForm = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:471
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}'
 */
        destroyForm.delete = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const laboratories = {
    index: Object.assign(index, index),
patients: Object.assign(patients, patients),
history: Object.assign(history, history),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
show: Object.assign(show, showBac614),
print: Object.assign(print, print),
results: Object.assign(results, results),
cancel: Object.assign(cancel, cancel),
destroy: Object.assign(destroy, destroy),
}

export default laboratories
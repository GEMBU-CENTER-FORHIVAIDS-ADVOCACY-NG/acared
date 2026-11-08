import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import records from './records'
import histories from './histories'
import presentPregnancy from './present-pregnancy'
import previousPregnancy from './previous-pregnancy'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/records',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
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
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\NursingController::index
 * @see app/Http/Controllers/NursingController.php:427
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
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
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
 */
export const history = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/records/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
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
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
 */
history.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
 */
history.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
 */
    const historyForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
 */
        historyForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\NursingController::history
 * @see app/Http/Controllers/NursingController.php:385
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/history'
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
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
export const view = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/records/{nursing}/{section?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
view.url = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    section: args[2],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
            "section",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                                section: args.section,
                }

    return view.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{section?}', parsedArgs.section?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
view.get = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
view.head = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
    const viewForm = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: view.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
        viewForm.get = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\NursingController::view
 * @see app/Http/Controllers/NursingController.php:53
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/{section?}'
 */
        viewForm.head = (args: { current_team?: string | number, nursing: number | { id: number }, section?: string | number } | [current_team: string | number, nursing: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    view.form = viewForm
/**
* @see \App\Http\Controllers\NursingController::start
 * @see app/Http/Controllers/NursingController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/start'
 */
export const start = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: start.url(args, options),
    method: 'patch',
})

start.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/start',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NursingController::start
 * @see app/Http/Controllers/NursingController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/start'
 */
start.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                }

    return start.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingController::start
 * @see app/Http/Controllers/NursingController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/start'
 */
start.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: start.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\NursingController::start
 * @see app/Http/Controllers/NursingController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/start'
 */
    const startForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NursingController::start
 * @see app/Http/Controllers/NursingController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/start'
 */
        startForm.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    start.form = startForm
/**
* @see \App\Http\Controllers\NursingController::end
 * @see app/Http/Controllers/NursingController.php:309
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/end'
 */
export const end = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: end.url(args, options),
    method: 'patch',
})

end.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/end',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NursingController::end
 * @see app/Http/Controllers/NursingController.php:309
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/end'
 */
end.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                }

    return end.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingController::end
 * @see app/Http/Controllers/NursingController.php:309
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/end'
 */
end.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: end.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\NursingController::end
 * @see app/Http/Controllers/NursingController.php:309
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/end'
 */
    const endForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: end.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NursingController::end
 * @see app/Http/Controllers/NursingController.php:309
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/end'
 */
        endForm.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: end.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    end.form = endForm
/**
* @see \App\Http\Controllers\NursingController::transfer
 * @see app/Http/Controllers/NursingController.php:323
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/transfer'
 */
export const transfer = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: transfer.url(args, options),
    method: 'patch',
})

transfer.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/transfer',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NursingController::transfer
 * @see app/Http/Controllers/NursingController.php:323
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/transfer'
 */
transfer.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                }

    return transfer.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingController::transfer
 * @see app/Http/Controllers/NursingController.php:323
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/transfer'
 */
transfer.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: transfer.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\NursingController::transfer
 * @see app/Http/Controllers/NursingController.php:323
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/transfer'
 */
    const transferForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfer.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NursingController::transfer
 * @see app/Http/Controllers/NursingController.php:323
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/transfer'
 */
        transferForm.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transfer.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    transfer.form = transferForm
/**
* @see \App\Http\Controllers\NursingController::store
 * @see app/Http/Controllers/NursingController.php:457
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/nursing/records',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NursingController::store
 * @see app/Http/Controllers/NursingController.php:457
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
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
* @see \App\Http\Controllers\NursingController::store
 * @see app/Http/Controllers/NursingController.php:457
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\NursingController::store
 * @see app/Http/Controllers/NursingController.php:457
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NursingController::store
 * @see app/Http/Controllers/NursingController.php:457
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\NursingController::update
 * @see app/Http/Controllers/NursingController.php:465
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
export const update = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NursingController::update
 * @see app/Http/Controllers/NursingController.php:465
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
update.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingController::update
 * @see app/Http/Controllers/NursingController.php:465
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
update.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\NursingController::update
 * @see app/Http/Controllers/NursingController.php:465
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
    const updateForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NursingController::update
 * @see app/Http/Controllers/NursingController.php:465
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
        updateForm.patch = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\NursingController::destroy
 * @see app/Http/Controllers/NursingController.php:472
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
export const destroy = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/records/{nursing}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\NursingController::destroy
 * @see app/Http/Controllers/NursingController.php:472
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
destroy.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingController::destroy
 * @see app/Http/Controllers/NursingController.php:472
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
destroy.delete = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\NursingController::destroy
 * @see app/Http/Controllers/NursingController.php:472
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
    const destroyForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NursingController::destroy
 * @see app/Http/Controllers/NursingController.php:472
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}'
 */
        destroyForm.delete = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const recordsNamespace = {
    index: Object.assign(index, index),
history: Object.assign(history, history),
view: Object.assign(view, view),
start: Object.assign(start, start),
end: Object.assign(end, end),
transfer: Object.assign(transfer, transfer),
records: Object.assign(records, records),
histories: Object.assign(histories, histories),
presentPregnancy: Object.assign(presentPregnancy, presentPregnancy),
previousPregnancy: Object.assign(previousPregnancy, previousPregnancy),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default recordsNamespace
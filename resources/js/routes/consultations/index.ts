import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import records from './records'
/**
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
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
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultationController::index
 * @see app/Http/Controllers/ConsultationController.php:62
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations'
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
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
 */
export const history = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultations/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
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
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
 */
history.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
 */
history.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
 */
    const historyForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
 */
        historyForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultationController::history
 * @see app/Http/Controllers/ConsultationController.php:101
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/history'
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
* @see \App\Http\Controllers\ConsultationController::start
 * @see app/Http/Controllers/ConsultationController.php:192
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/start'
 */
export const start = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: start.url(args, options),
    method: 'patch',
})

start.definition = {
    methods: ["patch"],
    url: '/{current_team?}/consultations/{consultation}/start',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConsultationController::start
 * @see app/Http/Controllers/ConsultationController.php:192
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/start'
 */
start.url = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    consultation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                consultation: typeof args.consultation === 'object'
                ? args.consultation.id
                : args.consultation,
                }

    return start.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{consultation}', parsedArgs.consultation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationController::start
 * @see app/Http/Controllers/ConsultationController.php:192
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/start'
 */
start.patch = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: start.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConsultationController::start
 * @see app/Http/Controllers/ConsultationController.php:192
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/start'
 */
    const startForm = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::start
 * @see app/Http/Controllers/ConsultationController.php:192
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/start'
 */
        startForm.patch = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ConsultationController::end
 * @see app/Http/Controllers/ConsultationController.php:211
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/end'
 */
export const end = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: end.url(args, options),
    method: 'patch',
})

end.definition = {
    methods: ["patch"],
    url: '/{current_team?}/consultations/{consultation}/end',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConsultationController::end
 * @see app/Http/Controllers/ConsultationController.php:211
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/end'
 */
end.url = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    consultation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                consultation: typeof args.consultation === 'object'
                ? args.consultation.id
                : args.consultation,
                }

    return end.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{consultation}', parsedArgs.consultation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationController::end
 * @see app/Http/Controllers/ConsultationController.php:211
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/end'
 */
end.patch = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: end.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConsultationController::end
 * @see app/Http/Controllers/ConsultationController.php:211
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/end'
 */
    const endForm = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: end.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::end
 * @see app/Http/Controllers/ConsultationController.php:211
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/end'
 */
        endForm.patch = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ConsultationController::transfer
 * @see app/Http/Controllers/ConsultationController.php:225
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/transfer'
 */
export const transfer = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: transfer.url(args, options),
    method: 'patch',
})

transfer.definition = {
    methods: ["patch"],
    url: '/{current_team?}/consultations/{consultation}/transfer',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConsultationController::transfer
 * @see app/Http/Controllers/ConsultationController.php:225
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/transfer'
 */
transfer.url = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    consultation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                consultation: typeof args.consultation === 'object'
                ? args.consultation.id
                : args.consultation,
                }

    return transfer.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{consultation}', parsedArgs.consultation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationController::transfer
 * @see app/Http/Controllers/ConsultationController.php:225
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/transfer'
 */
transfer.patch = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: transfer.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConsultationController::transfer
 * @see app/Http/Controllers/ConsultationController.php:225
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/transfer'
 */
    const transferForm = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfer.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::transfer
 * @see app/Http/Controllers/ConsultationController.php:225
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/transfer'
 */
        transferForm.patch = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
export const viewAll = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: viewAll.url(args, options),
    method: 'get',
})

viewAll.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultations/{consultation}/all',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
viewAll.url = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    consultation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                consultation: typeof args.consultation === 'object'
                ? args.consultation.id
                : args.consultation,
                }

    return viewAll.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{consultation}', parsedArgs.consultation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
viewAll.get = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: viewAll.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
viewAll.head = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: viewAll.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
    const viewAllForm = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: viewAll.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
        viewAllForm.get = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: viewAll.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultationController::viewAll
 * @see app/Http/Controllers/ConsultationController.php:174
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/all'
 */
        viewAllForm.head = (args: { current_team?: string | number, consultation: number | { id: number } } | [current_team: string | number, consultation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: viewAll.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    viewAll.form = viewAllForm
/**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
export const view = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultations/{consultation}/{section?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
view.url = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    consultation: args[1],
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
                                consultation: typeof args.consultation === 'object'
                ? args.consultation.id
                : args.consultation,
                                section: args.section,
                }

    return view.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{consultation}', parsedArgs.consultation.toString())
            .replace('{section?}', parsedArgs.section?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
view.get = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
view.head = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
    const viewForm = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: view.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
        viewForm.get = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultationController::view
 * @see app/Http/Controllers/ConsultationController.php:138
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultations/{consultation}/{section?}'
 */
        viewForm.head = (args: { current_team?: string | number, consultation: number | { id: number }, section?: string | number } | [current_team: string | number, consultation: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    view.form = viewForm
const consultations = {
    index: Object.assign(index, index),
history: Object.assign(history, history),
start: Object.assign(start, start),
end: Object.assign(end, end),
transfer: Object.assign(transfer, transfer),
records: Object.assign(records, records),
viewAll: Object.assign(viewAll, viewAll),
view: Object.assign(view, view),
}

export default consultations
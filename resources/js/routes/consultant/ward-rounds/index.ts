import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import admissions from './admissions'
import patients from './patients'
import records from './records'
/**
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultant/ward-rounds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
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
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::index
 * @see app/Http/Controllers/ConsultantWardRoundController.php:80
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds'
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
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
export const show = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultant/ward-rounds/{ward}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
show.url = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{ward}', parsedArgs.ward.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
show.get = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
show.head = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
    const showForm = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
        showForm.get = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::show
 * @see app/Http/Controllers/ConsultantWardRoundController.php:156
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}'
 */
        showForm.head = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
export const view = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
view.url = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    admission: args[1],
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
                                admission: typeof args.admission === 'object'
                ? args.admission.id
                : args.admission,
                                section: args.section,
                }

    return view.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{admission}', parsedArgs.admission.toString())
            .replace('{section?}', parsedArgs.section?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
view.get = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
view.head = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
    const viewForm = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: view.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
        viewForm.get = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::view
 * @see app/Http/Controllers/ConsultantWardRoundController.php:204
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/{section?}'
 */
        viewForm.head = (args: { current_team?: string | number, admission: number | { id: number }, section?: string | number } | [current_team: string | number, admission: number | { id: number }, section: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\ConsultantWardRoundController::admit
 * @see app/Http/Controllers/ConsultantWardRoundController.php:259
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}/admit'
 */
export const admit = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: admit.url(args, options),
    method: 'post',
})

admit.definition = {
    methods: ["post"],
    url: '/{current_team?}/consultant/ward-rounds/{ward}/admit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::admit
 * @see app/Http/Controllers/ConsultantWardRoundController.php:259
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}/admit'
 */
admit.url = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return admit.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{ward}', parsedArgs.ward.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::admit
 * @see app/Http/Controllers/ConsultantWardRoundController.php:259
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}/admit'
 */
admit.post = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: admit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConsultantWardRoundController::admit
 * @see app/Http/Controllers/ConsultantWardRoundController.php:259
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}/admit'
 */
    const admitForm = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: admit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::admit
 * @see app/Http/Controllers/ConsultantWardRoundController.php:259
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/{ward}/admit'
 */
        admitForm.post = (args: { current_team?: string | number, ward: number | { id: number } } | [current_team: string | number, ward: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: admit.url(args, options),
            method: 'post',
        })
    
    admit.form = admitForm
/**
* @see \App\Http\Controllers\ConsultantWardRoundController::cancelAdmission
 * @see app/Http/Controllers/ConsultantWardRoundController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/cancel'
 */
export const cancelAdmission = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: cancelAdmission.url(args, options),
    method: 'patch',
})

cancelAdmission.definition = {
    methods: ["patch"],
    url: '/{current_team?}/consultant/ward-rounds/admissions/{admission}/cancel',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::cancelAdmission
 * @see app/Http/Controllers/ConsultantWardRoundController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/cancel'
 */
cancelAdmission.url = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    admission: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                admission: typeof args.admission === 'object'
                ? args.admission.id
                : args.admission,
                }

    return cancelAdmission.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{admission}', parsedArgs.admission.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::cancelAdmission
 * @see app/Http/Controllers/ConsultantWardRoundController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/cancel'
 */
cancelAdmission.patch = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: cancelAdmission.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConsultantWardRoundController::cancelAdmission
 * @see app/Http/Controllers/ConsultantWardRoundController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/cancel'
 */
    const cancelAdmissionForm = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancelAdmission.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::cancelAdmission
 * @see app/Http/Controllers/ConsultantWardRoundController.php:290
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/cancel'
 */
        cancelAdmissionForm.patch = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancelAdmission.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    cancelAdmission.form = cancelAdmissionForm
/**
* @see \App\Http\Controllers\ConsultantWardRoundController::discharge
 * @see app/Http/Controllers/ConsultantWardRoundController.php:299
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/discharge'
 */
export const discharge = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: discharge.url(args, options),
    method: 'patch',
})

discharge.definition = {
    methods: ["patch"],
    url: '/{current_team?}/consultant/ward-rounds/admissions/{admission}/discharge',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::discharge
 * @see app/Http/Controllers/ConsultantWardRoundController.php:299
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/discharge'
 */
discharge.url = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    admission: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                admission: typeof args.admission === 'object'
                ? args.admission.id
                : args.admission,
                }

    return discharge.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{admission}', parsedArgs.admission.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultantWardRoundController::discharge
 * @see app/Http/Controllers/ConsultantWardRoundController.php:299
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/discharge'
 */
discharge.patch = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: discharge.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConsultantWardRoundController::discharge
 * @see app/Http/Controllers/ConsultantWardRoundController.php:299
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/discharge'
 */
    const dischargeForm = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: discharge.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConsultantWardRoundController::discharge
 * @see app/Http/Controllers/ConsultantWardRoundController.php:299
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/admissions/{admission}/discharge'
 */
        dischargeForm.patch = (args: { current_team?: string | number, admission: number | { id: number } } | [current_team: string | number, admission: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: discharge.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    discharge.form = dischargeForm
/**
* @see \App\Http\Controllers\WardRoundBillingController::billing
 * @see app/Http/Controllers/WardRoundBillingController.php:21
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/billing'
 */
export const billing = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billing.url(args, options),
    method: 'post',
})

billing.definition = {
    methods: ["post"],
    url: '/{current_team?}/consultant/ward-rounds/billing',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WardRoundBillingController::billing
 * @see app/Http/Controllers/WardRoundBillingController.php:21
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/billing'
 */
billing.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return billing.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WardRoundBillingController::billing
 * @see app/Http/Controllers/WardRoundBillingController.php:21
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/billing'
 */
billing.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: billing.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WardRoundBillingController::billing
 * @see app/Http/Controllers/WardRoundBillingController.php:21
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/billing'
 */
    const billingForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: billing.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WardRoundBillingController::billing
 * @see app/Http/Controllers/WardRoundBillingController.php:21
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/consultant/ward-rounds/billing'
 */
        billingForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: billing.url(args, options),
            method: 'post',
        })
    
    billing.form = billingForm
const wardRounds = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
admissions: Object.assign(admissions, admissions),
patients: Object.assign(patients, patients),
view: Object.assign(view, view),
admit: Object.assign(admit, admit),
cancelAdmission: Object.assign(cancelAdmission, cancelAdmission),
discharge: Object.assign(discharge, discharge),
records: Object.assign(records, records),
billing: Object.assign(billing, billing),
}

export default wardRounds
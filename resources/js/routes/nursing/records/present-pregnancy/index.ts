import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
export const index = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/records/{nursing}/present-pregnancy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
index.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
index.get = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
index.head = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
    const indexForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
        indexForm.get = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PresentPregnancyController::index
 * @see app/Http/Controllers/PresentPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
        indexForm.head = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\PresentPregnancyController::store
 * @see app/Http/Controllers/PresentPregnancyController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
export const store = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/nursing/records/{nursing}/present-pregnancy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PresentPregnancyController::store
 * @see app/Http/Controllers/PresentPregnancyController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
store.url = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PresentPregnancyController::store
 * @see app/Http/Controllers/PresentPregnancyController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
store.post = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PresentPregnancyController::store
 * @see app/Http/Controllers/PresentPregnancyController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
    const storeForm = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PresentPregnancyController::store
 * @see app/Http/Controllers/PresentPregnancyController.php:54
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy'
 */
        storeForm.post = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PresentPregnancyController::update
 * @see app/Http/Controllers/PresentPregnancyController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
export const update = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PresentPregnancyController::update
 * @see app/Http/Controllers/PresentPregnancyController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
update.url = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    presentPregnancy: args[2],
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
                                presentPregnancy: typeof args.presentPregnancy === 'object'
                ? args.presentPregnancy.id
                : args.presentPregnancy,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{presentPregnancy}', parsedArgs.presentPregnancy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PresentPregnancyController::update
 * @see app/Http/Controllers/PresentPregnancyController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
update.patch = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\PresentPregnancyController::update
 * @see app/Http/Controllers/PresentPregnancyController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
    const updateForm = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PresentPregnancyController::update
 * @see app/Http/Controllers/PresentPregnancyController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
        updateForm.patch = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PresentPregnancyController::destroy
 * @see app/Http/Controllers/PresentPregnancyController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
export const destroy = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PresentPregnancyController::destroy
 * @see app/Http/Controllers/PresentPregnancyController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
destroy.url = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    presentPregnancy: args[2],
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
                                presentPregnancy: typeof args.presentPregnancy === 'object'
                ? args.presentPregnancy.id
                : args.presentPregnancy,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{presentPregnancy}', parsedArgs.presentPregnancy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PresentPregnancyController::destroy
 * @see app/Http/Controllers/PresentPregnancyController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
destroy.delete = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PresentPregnancyController::destroy
 * @see app/Http/Controllers/PresentPregnancyController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
    const destroyForm = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PresentPregnancyController::destroy
 * @see app/Http/Controllers/PresentPregnancyController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/present-pregnancy/{presentPregnancy}'
 */
        destroyForm.delete = (args: { current_team?: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, presentPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const presentPregnancy = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default presentPregnancy
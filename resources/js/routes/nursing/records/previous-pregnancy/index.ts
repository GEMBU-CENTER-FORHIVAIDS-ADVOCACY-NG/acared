import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PreviousPregnancyController::index
 * @see app/Http/Controllers/PreviousPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
 */
export const index = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/records/{nursing}/previous-pregnancy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PreviousPregnancyController::index
 * @see app/Http/Controllers/PreviousPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
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
* @see \App\Http\Controllers\PreviousPregnancyController::index
 * @see app/Http/Controllers/PreviousPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
 */
index.get = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PreviousPregnancyController::index
 * @see app/Http/Controllers/PreviousPregnancyController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
 */
index.head = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PreviousPregnancyController::store
 * @see app/Http/Controllers/PreviousPregnancyController.php:55
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
 */
export const store = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/nursing/records/{nursing}/previous-pregnancy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PreviousPregnancyController::store
 * @see app/Http/Controllers/PreviousPregnancyController.php:55
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
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
* @see \App\Http\Controllers\PreviousPregnancyController::store
 * @see app/Http/Controllers/PreviousPregnancyController.php:55
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy'
 */
store.post = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PreviousPregnancyController::update
 * @see app/Http/Controllers/PreviousPregnancyController.php:71
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}'
 */
export const update = (args: { current_team?: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PreviousPregnancyController::update
 * @see app/Http/Controllers/PreviousPregnancyController.php:71
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}'
 */
update.url = (args: { current_team?: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    previousPregnancy: args[2],
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
                                previousPregnancy: typeof args.previousPregnancy === 'object'
                ? args.previousPregnancy.id
                : args.previousPregnancy,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{previousPregnancy}', parsedArgs.previousPregnancy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PreviousPregnancyController::update
 * @see app/Http/Controllers/PreviousPregnancyController.php:71
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}'
 */
update.patch = (args: { current_team?: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PreviousPregnancyController::destroy
 * @see app/Http/Controllers/PreviousPregnancyController.php:83
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}'
 */
export const destroy = (args: { current_team?: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PreviousPregnancyController::destroy
 * @see app/Http/Controllers/PreviousPregnancyController.php:83
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}'
 */
destroy.url = (args: { current_team?: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    previousPregnancy: args[2],
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
                                previousPregnancy: typeof args.previousPregnancy === 'object'
                ? args.previousPregnancy.id
                : args.previousPregnancy,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{previousPregnancy}', parsedArgs.previousPregnancy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PreviousPregnancyController::destroy
 * @see app/Http/Controllers/PreviousPregnancyController.php:83
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}'
 */
destroy.delete = (args: { current_team?: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, previousPregnancy: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const previousPregnancy = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default previousPregnancy
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\NursingHistoryController::index
* @see app/Http/Controllers/NursingHistoryController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
*/
export const index = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/records/{nursing}/histories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NursingHistoryController::index
* @see app/Http/Controllers/NursingHistoryController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
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
* @see \App\Http\Controllers\NursingHistoryController::index
* @see app/Http/Controllers/NursingHistoryController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
*/
index.get = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NursingHistoryController::index
* @see app/Http/Controllers/NursingHistoryController.php:15
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
*/
index.head = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\NursingHistoryController::store
* @see app/Http/Controllers/NursingHistoryController.php:46
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
*/
export const store = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/nursing/records/{nursing}/histories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NursingHistoryController::store
* @see app/Http/Controllers/NursingHistoryController.php:46
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
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
* @see \App\Http\Controllers\NursingHistoryController::store
* @see app/Http/Controllers/NursingHistoryController.php:46
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories'
*/
store.post = (args: { current_team?: string | number, nursing: number | { id: number } } | [current_team: string | number, nursing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NursingHistoryController::update
* @see app/Http/Controllers/NursingHistoryController.php:62
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories/{history}'
*/
export const update = (args: { current_team?: string | number, nursing: number | { id: number }, history: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/histories/{history}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NursingHistoryController::update
* @see app/Http/Controllers/NursingHistoryController.php:62
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories/{history}'
*/
update.url = (args: { current_team?: string | number, nursing: number | { id: number }, history: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, history: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            nursing: args[1],
            history: args[2],
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
        history: typeof args.history === 'object'
        ? args.history.id
        : args.history,
    }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{history}', parsedArgs.history.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingHistoryController::update
* @see app/Http/Controllers/NursingHistoryController.php:62
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories/{history}'
*/
update.patch = (args: { current_team?: string | number, nursing: number | { id: number }, history: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\NursingHistoryController::destroy
* @see app/Http/Controllers/NursingHistoryController.php:74
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories/{history}'
*/
export const destroy = (args: { current_team?: string | number, nursing: number | { id: number }, history: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/records/{nursing}/histories/{history}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\NursingHistoryController::destroy
* @see app/Http/Controllers/NursingHistoryController.php:74
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories/{history}'
*/
destroy.url = (args: { current_team?: string | number, nursing: number | { id: number }, history: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, history: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            nursing: args[1],
            history: args[2],
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
        history: typeof args.history === 'object'
        ? args.history.id
        : args.history,
    }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{history}', parsedArgs.history.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NursingHistoryController::destroy
* @see app/Http/Controllers/NursingHistoryController.php:74
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/nursing/records/{nursing}/histories/{history}'
*/
destroy.delete = (args: { current_team?: string | number, nursing: number | { id: number }, history: number | { id: number } } | [current_team: string | number, nursing: number | { id: number }, history: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const histories = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default histories
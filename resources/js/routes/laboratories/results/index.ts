import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:337
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/results'
 */
export const store = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/laboratories/{laboratory}/results',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:337
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/results'
 */
store.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::store
 * @see app/Http/Controllers/LaboratoryController.php:337
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/results'
 */
store.post = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\LaboratoryController::update
 * @see app/Http/Controllers/LaboratoryController.php:354
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/results'
 */
export const update = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/laboratories/{laboratory}/results',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\LaboratoryController::update
 * @see app/Http/Controllers/LaboratoryController.php:354
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/results'
 */
update.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::update
 * @see app/Http/Controllers/LaboratoryController.php:354
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/results'
 */
update.patch = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})
const results = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default results
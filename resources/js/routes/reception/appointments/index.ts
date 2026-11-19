import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ReceptionController::store
 * @see app/Http/Controllers/ReceptionController.php:63
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/appointments'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/reception/appointments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ReceptionController::store
 * @see app/Http/Controllers/ReceptionController.php:63
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/appointments'
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
* @see \App\Http\Controllers\ReceptionController::store
 * @see app/Http/Controllers/ReceptionController.php:63
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/appointments'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})
const appointments = {
    store: Object.assign(store, store),
}

export default appointments
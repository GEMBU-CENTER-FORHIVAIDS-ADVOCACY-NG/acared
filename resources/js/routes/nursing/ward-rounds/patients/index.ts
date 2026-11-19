import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WardRoundController::search
 * @see app/Http/Controllers/WardRoundController.php:486
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/ward-rounds/patients/search'
 */
export const search = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/ward-rounds/patients/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WardRoundController::search
 * @see app/Http/Controllers/WardRoundController.php:486
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/ward-rounds/patients/search'
 */
search.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return search.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WardRoundController::search
 * @see app/Http/Controllers/WardRoundController.php:486
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/ward-rounds/patients/search'
 */
search.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WardRoundController::search
 * @see app/Http/Controllers/WardRoundController.php:486
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/ward-rounds/patients/search'
 */
search.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(args, options),
    method: 'head',
})
const patients = {
    search: Object.assign(search, search),
}

export default patients
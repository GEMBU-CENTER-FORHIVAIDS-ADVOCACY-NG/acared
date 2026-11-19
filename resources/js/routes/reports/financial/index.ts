import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\FinanceController::index
 * @see app/Http/Controllers/FinanceController.php:49
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/financial'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/financial',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FinanceController::index
 * @see app/Http/Controllers/FinanceController.php:49
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/financial'
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
* @see \App\Http\Controllers\FinanceController::index
 * @see app/Http/Controllers/FinanceController.php:49
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/financial'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\FinanceController::index
 * @see app/Http/Controllers/FinanceController.php:49
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/financial'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})
const financial = {
    index: Object.assign(index, index),
}

export default financial
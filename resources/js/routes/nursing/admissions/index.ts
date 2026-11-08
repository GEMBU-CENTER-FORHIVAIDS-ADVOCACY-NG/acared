import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/nursing/admissions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
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
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WardRoundController::index
 * @see app/Http/Controllers/WardRoundController.php:41
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/admissions'
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
const admissions = {
    index: Object.assign(index, index),
}

export default admissions
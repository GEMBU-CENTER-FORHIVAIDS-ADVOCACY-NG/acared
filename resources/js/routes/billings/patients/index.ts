import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
 */
export const search = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/billings/patients/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
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
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
 */
search.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
 */
search.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
 */
    const searchForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: search.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
 */
        searchForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: search.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BillingController::search
 * @see app/Http/Controllers/BillingController.php:149
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/billings/patients/search'
 */
        searchForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: search.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    search.form = searchForm
const patients = {
    search: Object.assign(search, search),
}

export default patients
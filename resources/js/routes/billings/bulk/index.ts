import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\BillingController::destroy
* @see app/Http/Controllers/BillingController.php:514
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/billings/bulk'
*/
export const destroy = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/billings/bulk',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BillingController::destroy
* @see app/Http/Controllers/BillingController.php:514
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/billings/bulk'
*/
destroy.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::destroy
* @see app/Http/Controllers/BillingController.php:514
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/billings/bulk'
*/
destroy.delete = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const bulk = {
    destroy: Object.assign(destroy, destroy),
}

export default bulk
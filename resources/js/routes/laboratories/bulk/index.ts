import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:459
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/bulk'
 */
export const destroy = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/laboratories/bulk',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:459
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/bulk'
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
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:459
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/bulk'
 */
destroy.delete = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:459
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/bulk'
 */
    const destroyForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::destroy
 * @see app/Http/Controllers/LaboratoryController.php:459
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/bulk'
 */
        destroyForm.delete = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const bulk = {
    destroy: Object.assign(destroy, destroy),
}

export default bulk
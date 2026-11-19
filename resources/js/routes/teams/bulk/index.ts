import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Teams\TeamController::destroy
 * @see app/Http/Controllers/Teams/TeamController.php:251
 * @route '/settings/teams/bulk'
 */
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/teams/bulk',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teams\TeamController::destroy
 * @see app/Http/Controllers/Teams/TeamController.php:251
 * @route '/settings/teams/bulk'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamController::destroy
 * @see app/Http/Controllers/Teams/TeamController.php:251
 * @route '/settings/teams/bulk'
 */
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Teams\TeamController::destroy
 * @see app/Http/Controllers/Teams/TeamController.php:251
 * @route '/settings/teams/bulk'
 */
    const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teams\TeamController::destroy
 * @see app/Http/Controllers/Teams/TeamController.php:251
 * @route '/settings/teams/bulk'
 */
        destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url({
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
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\RoleController::destroy
 * @see app/Http/Controllers/Settings/RoleController.php:93
 * @route '/settings/roles/bulk'
 */
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/roles/bulk',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\RoleController::destroy
 * @see app/Http/Controllers/Settings/RoleController.php:93
 * @route '/settings/roles/bulk'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\RoleController::destroy
 * @see app/Http/Controllers/Settings/RoleController.php:93
 * @route '/settings/roles/bulk'
 */
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\RoleController::destroy
 * @see app/Http/Controllers/Settings/RoleController.php:93
 * @route '/settings/roles/bulk'
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
* @see \App\Http\Controllers\Settings\RoleController::destroy
 * @see app/Http/Controllers/Settings/RoleController.php:93
 * @route '/settings/roles/bulk'
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
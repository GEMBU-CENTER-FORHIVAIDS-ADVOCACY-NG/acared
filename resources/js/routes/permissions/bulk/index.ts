import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PermissionController::destroy
 * @see app/Http/Controllers/Settings/PermissionController.php:64
 * @route '/settings/permissions/bulk'
 */
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/permissions/bulk',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\PermissionController::destroy
 * @see app/Http/Controllers/Settings/PermissionController.php:64
 * @route '/settings/permissions/bulk'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PermissionController::destroy
 * @see app/Http/Controllers/Settings/PermissionController.php:64
 * @route '/settings/permissions/bulk'
 */
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\PermissionController::destroy
 * @see app/Http/Controllers/Settings/PermissionController.php:64
 * @route '/settings/permissions/bulk'
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
* @see \App\Http\Controllers\Settings\PermissionController::destroy
 * @see app/Http/Controllers/Settings/PermissionController.php:64
 * @route '/settings/permissions/bulk'
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
import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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

const bulk = {
    destroy: Object.assign(destroy, destroy),
}

export default bulk
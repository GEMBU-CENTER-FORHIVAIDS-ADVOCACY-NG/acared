import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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

const bulk = {
    destroy: Object.assign(destroy, destroy),
}

export default bulk
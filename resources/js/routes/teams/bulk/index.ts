import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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

const bulk = {
    destroy: Object.assign(destroy, destroy),
}

export default bulk
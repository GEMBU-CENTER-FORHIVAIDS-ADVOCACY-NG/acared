import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:240
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/drug-forms'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/lab-inventories/drug-forms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:240
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/drug-forms'
 */
store.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:240
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/drug-forms'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:240
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/drug-forms'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabInventoryController::store
 * @see app/Http/Controllers/LabInventoryController.php:240
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/lab-inventories/drug-forms'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const drugForms = {
    store: Object.assign(store, store),
}

export default drugForms
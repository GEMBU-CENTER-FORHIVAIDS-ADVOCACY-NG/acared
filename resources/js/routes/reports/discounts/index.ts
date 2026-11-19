import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DiscountReportController::index
 * @see app/Http/Controllers/DiscountReportController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/discounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DiscountReportController::index
 * @see app/Http/Controllers/DiscountReportController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts'
 */
index.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiscountReportController::index
 * @see app/Http/Controllers/DiscountReportController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DiscountReportController::index
 * @see app/Http/Controllers/DiscountReportController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DiscountReportController::exportMethod
 * @see app/Http/Controllers/DiscountReportController.php:44
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts/export'
 */
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/discounts/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DiscountReportController::exportMethod
 * @see app/Http/Controllers/DiscountReportController.php:44
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts/export'
 */
exportMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiscountReportController::exportMethod
 * @see app/Http/Controllers/DiscountReportController.php:44
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts/export'
 */
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DiscountReportController::exportMethod
 * @see app/Http/Controllers/DiscountReportController.php:44
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/discounts/export'
 */
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})
const discounts = {
    index: Object.assign(index, index),
export: Object.assign(exportMethod, exportMethod),
}

export default discounts
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
* @see app/Http/Controllers/OperationalReportController.php:265
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list/export'
*/
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/price-list/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
* @see app/Http/Controllers/OperationalReportController.php:265
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list/export'
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
* @see \App\Http\Controllers\OperationalReportController::exportMethod
* @see app/Http/Controllers/OperationalReportController.php:265
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list/export'
*/
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
* @see app/Http/Controllers/OperationalReportController.php:265
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list/export'
*/
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

const priceList = {
    export: Object.assign(exportMethod, exportMethod),
}

export default priceList
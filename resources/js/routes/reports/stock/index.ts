import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\StockReportController::exportMethod
 * @see app/Http/Controllers/StockReportController.php:93
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report}/export'
 */
export const exportMethod = (args: { current_team?: string | number, report: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/stock/{report}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StockReportController::exportMethod
 * @see app/Http/Controllers/StockReportController.php:93
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report}/export'
 */
exportMethod.url = (args: { current_team?: string | number, report: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    report: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                report: args.report,
                }

    return exportMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{report}', parsedArgs.report.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StockReportController::exportMethod
 * @see app/Http/Controllers/StockReportController.php:93
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report}/export'
 */
exportMethod.get = (args: { current_team?: string | number, report: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StockReportController::exportMethod
 * @see app/Http/Controllers/StockReportController.php:93
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report}/export'
 */
exportMethod.head = (args: { current_team?: string | number, report: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StockReportController::index
 * @see app/Http/Controllers/StockReportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report?}'
 */
export const index = (args?: { current_team?: string | number, report?: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/stock/{report?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StockReportController::index
 * @see app/Http/Controllers/StockReportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report?}'
 */
index.url = (args?: { current_team?: string | number, report?: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    report: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
            "report",
        ])

    const parsedArgs = {
                        current_team: args?.current_team ?? '$currentTeam',
                                report: args?.report,
                }

    return index.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{report?}', parsedArgs.report?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StockReportController::index
 * @see app/Http/Controllers/StockReportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report?}'
 */
index.get = (args?: { current_team?: string | number, report?: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StockReportController::index
 * @see app/Http/Controllers/StockReportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/stock/{report?}'
 */
index.head = (args?: { current_team?: string | number, report?: string | number } | [current_team: string | number, report: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})
const stock = {
    export: Object.assign(exportMethod, exportMethod),
index: Object.assign(index, index),
}

export default stock
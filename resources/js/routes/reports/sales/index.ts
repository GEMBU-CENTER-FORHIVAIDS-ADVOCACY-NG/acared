import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SalesReportController::index
* @see app/Http/Controllers/SalesReportController.php:35
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension?}'
*/
export const index = (args?: { current_team?: string | number, dimension?: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/sales/{dimension?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SalesReportController::index
* @see app/Http/Controllers/SalesReportController.php:35
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension?}'
*/
index.url = (args?: { current_team?: string | number, dimension?: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            dimension: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
        "dimension",
    ])

    const parsedArgs = {
        current_team: args?.current_team ?? '$currentTeam',
        dimension: args?.dimension,
    }

    return index.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{dimension?}', parsedArgs.dimension?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SalesReportController::index
* @see app/Http/Controllers/SalesReportController.php:35
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension?}'
*/
index.get = (args?: { current_team?: string | number, dimension?: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SalesReportController::index
* @see app/Http/Controllers/SalesReportController.php:35
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension?}'
*/
index.head = (args?: { current_team?: string | number, dimension?: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SalesReportController::exportMethod
* @see app/Http/Controllers/SalesReportController.php:80
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension}/export'
*/
export const exportMethod = (args: { current_team?: string | number, dimension: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/sales/{dimension}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SalesReportController::exportMethod
* @see app/Http/Controllers/SalesReportController.php:80
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension}/export'
*/
exportMethod.url = (args: { current_team?: string | number, dimension: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            dimension: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        dimension: args.dimension,
    }

    return exportMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{dimension}', parsedArgs.dimension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SalesReportController::exportMethod
* @see app/Http/Controllers/SalesReportController.php:80
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension}/export'
*/
exportMethod.get = (args: { current_team?: string | number, dimension: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SalesReportController::exportMethod
* @see app/Http/Controllers/SalesReportController.php:80
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/sales/{dimension}/export'
*/
exportMethod.head = (args: { current_team?: string | number, dimension: string | number } | [current_team: string | number, dimension: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

const sales = {
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
}

export default sales
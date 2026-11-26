import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OperationalReportController::preview
* @see app/Http/Controllers/OperationalReportController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction/import/preview'
*/
export const preview = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/{current_team?}/reports/employee-deduction/import/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationalReportController::preview
* @see app/Http/Controllers/OperationalReportController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction/import/preview'
*/
preview.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return preview.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationalReportController::preview
* @see app/Http/Controllers/OperationalReportController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction/import/preview'
*/
preview.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})


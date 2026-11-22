import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
 */
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/employee-deduction/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
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
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
 */
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
 */
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
 */
    const exportMethodForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
 */
        exportMethodForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OperationalReportController::exportMethod
 * @see app/Http/Controllers/OperationalReportController.php:57
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/export'
 */
        exportMethodForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
/**
* @see \App\Http\Controllers\OperationalReportController::importMethod
 * @see app/Http/Controllers/OperationalReportController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/import'
 */
export const importMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/{current_team?}/reports/employee-deduction/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationalReportController::importMethod
 * @see app/Http/Controllers/OperationalReportController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/import'
 */
importMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return importMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationalReportController::importMethod
 * @see app/Http/Controllers/OperationalReportController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/import'
 */
importMethod.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\OperationalReportController::importMethod
 * @see app/Http/Controllers/OperationalReportController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/import'
 */
    const importMethodForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: importMethod.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OperationalReportController::importMethod
 * @see app/Http/Controllers/OperationalReportController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/employee-deduction/import'
 */
        importMethodForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: importMethod.url(args, options),
            method: 'post',
        })
    
    importMethod.form = importMethodForm
const employeeDeduction = {
    export: Object.assign(exportMethod, exportMethod),
import: Object.assign(importMethod, importMethod),
}

export default employeeDeduction
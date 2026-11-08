import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/laboratory-tests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
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
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryTestsReportController::index
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests'
 */
        indexForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
 */
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/laboratory-tests/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
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
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
 */
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
 */
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
 */
    const exportMethodForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
 */
        exportMethodForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryTestsReportController::exportMethod
 * @see app/Http/Controllers/LaboratoryTestsReportController.php:70
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/laboratory-tests/export'
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
const laboratoryTests = {
    index: Object.assign(index, index),
export: Object.assign(exportMethod, exportMethod),
}

export default laboratoryTests
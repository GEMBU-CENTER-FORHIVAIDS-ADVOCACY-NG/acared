import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PaymentMethodSalesReportController::index
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:16
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/payment-method-sales-summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PaymentMethodSalesReportController::index
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:16
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary'
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
* @see \App\Http\Controllers\PaymentMethodSalesReportController::index
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:16
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PaymentMethodSalesReportController::index
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:16
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PaymentMethodSalesReportController::exportMethod
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:30
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary/export'
 */
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/payment-method-sales-summary/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PaymentMethodSalesReportController::exportMethod
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:30
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary/export'
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
* @see \App\Http\Controllers\PaymentMethodSalesReportController::exportMethod
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:30
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary/export'
 */
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PaymentMethodSalesReportController::exportMethod
 * @see app/Http/Controllers/PaymentMethodSalesReportController.php:30
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reports/payment-method-sales-summary/export'
 */
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})
const paymentMethodSalesSummary = {
    index: Object.assign(index, index),
export: Object.assign(exportMethod, exportMethod),
}

export default paymentMethodSalesSummary
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import financial from './financial'
import sales from './sales'
import clinical from './clinical'
import couponUsages from './coupon-usages'
import discounts from './discounts'
import categorySalesSummary from './category-sales-summary'
import paymentMethodSalesSummary from './payment-method-sales-summary'
import wallet0fdd46 from './wallet'
import employeeDeductionE2100e from './employee-deduction'
import priceList8821c3 from './price-list'
import laboratoryB38260 from './laboratory'
import laboratoryTests from './laboratory-tests'
import stock from './stock'
import activityLogs from './activity-logs'
/**
* @see \App\Http\Controllers\ReportCatalogController::index
* @see app/Http/Controllers/ReportCatalogController.php:99
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports'
*/
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportCatalogController::index
* @see app/Http/Controllers/ReportCatalogController.php:99
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports'
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
* @see \App\Http\Controllers\ReportCatalogController::index
* @see app/Http/Controllers/ReportCatalogController.php:99
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports'
*/
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportCatalogController::index
* @see app/Http/Controllers/ReportCatalogController.php:99
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports'
*/
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FinanceController::finance
* @see app/Http/Controllers/FinanceController.php:49
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/finance'
*/
export const finance = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: finance.url(args, options),
    method: 'get',
})

finance.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/finance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FinanceController::finance
* @see app/Http/Controllers/FinanceController.php:49
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/finance'
*/
finance.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return finance.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceController::finance
* @see app/Http/Controllers/FinanceController.php:49
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/finance'
*/
finance.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: finance.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FinanceController::finance
* @see app/Http/Controllers/FinanceController.php:49
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/finance'
*/
finance.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: finance.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationalReportController::wallet
* @see app/Http/Controllers/OperationalReportController.php:169
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/wallet'
*/
export const wallet = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: wallet.url(args, options),
    method: 'get',
})

wallet.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/wallet',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationalReportController::wallet
* @see app/Http/Controllers/OperationalReportController.php:169
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/wallet'
*/
wallet.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return wallet.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationalReportController::wallet
* @see app/Http/Controllers/OperationalReportController.php:169
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/wallet'
*/
wallet.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: wallet.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationalReportController::wallet
* @see app/Http/Controllers/OperationalReportController.php:169
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/wallet'
*/
wallet.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: wallet.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationalReportController::employeeDeduction
* @see app/Http/Controllers/OperationalReportController.php:21
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction'
*/
export const employeeDeduction = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employeeDeduction.url(args, options),
    method: 'get',
})

employeeDeduction.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/employee-deduction',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationalReportController::employeeDeduction
* @see app/Http/Controllers/OperationalReportController.php:21
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction'
*/
employeeDeduction.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return employeeDeduction.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationalReportController::employeeDeduction
* @see app/Http/Controllers/OperationalReportController.php:21
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction'
*/
employeeDeduction.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employeeDeduction.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationalReportController::employeeDeduction
* @see app/Http/Controllers/OperationalReportController.php:21
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/employee-deduction'
*/
employeeDeduction.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employeeDeduction.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationalReportController::priceList
* @see app/Http/Controllers/OperationalReportController.php:220
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list'
*/
export const priceList = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: priceList.url(args, options),
    method: 'get',
})

priceList.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/price-list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationalReportController::priceList
* @see app/Http/Controllers/OperationalReportController.php:220
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list'
*/
priceList.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return priceList.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationalReportController::priceList
* @see app/Http/Controllers/OperationalReportController.php:220
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list'
*/
priceList.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: priceList.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationalReportController::priceList
* @see app/Http/Controllers/OperationalReportController.php:220
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/price-list'
*/
priceList.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: priceList.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FinanceController::laboratory
* @see app/Http/Controllers/FinanceController.php:83
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/laboratory'
*/
export const laboratory = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: laboratory.url(args, options),
    method: 'get',
})

laboratory.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reports/laboratory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FinanceController::laboratory
* @see app/Http/Controllers/FinanceController.php:83
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/laboratory'
*/
laboratory.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return laboratory.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FinanceController::laboratory
* @see app/Http/Controllers/FinanceController.php:83
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/laboratory'
*/
laboratory.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: laboratory.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FinanceController::laboratory
* @see app/Http/Controllers/FinanceController.php:83
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reports/laboratory'
*/
laboratory.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: laboratory.url(args, options),
    method: 'head',
})

const reports = {
    index: Object.assign(index, index),
    financial: Object.assign(financial, financial),
    finance: Object.assign(finance, finance),
    sales: Object.assign(sales, sales),
    clinical: Object.assign(clinical, clinical),
    couponUsages: Object.assign(couponUsages, couponUsages),
    discounts: Object.assign(discounts, discounts),
    categorySalesSummary: Object.assign(categorySalesSummary, categorySalesSummary),
    paymentMethodSalesSummary: Object.assign(paymentMethodSalesSummary, paymentMethodSalesSummary),
    wallet: Object.assign(wallet, wallet0fdd46),
    employeeDeduction: Object.assign(employeeDeduction, employeeDeductionE2100e),
    priceList: Object.assign(priceList, priceList8821c3),
    laboratory: Object.assign(laboratory, laboratoryB38260),
    laboratoryTests: Object.assign(laboratoryTests, laboratoryTests),
    stock: Object.assign(stock, stock),
    activityLogs: Object.assign(activityLogs, activityLogs),
}

export default reports
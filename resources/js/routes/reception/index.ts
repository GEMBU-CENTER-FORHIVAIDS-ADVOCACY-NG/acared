import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import appointments from './appointments'
import patient from './patient'
/**
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reception',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
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
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ReceptionController::index
 * @see app/Http/Controllers/ReceptionController.php:29
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception'
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
* @see \App\Http\Controllers\ReceptionController::transfer
 * @see app/Http/Controllers/ReceptionController.php:107
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/transfer'
 */
export const transfer = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: transfer.url(args, options),
    method: 'patch',
})

transfer.definition = {
    methods: ["patch"],
    url: '/{current_team?}/reception/transfer',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ReceptionController::transfer
 * @see app/Http/Controllers/ReceptionController.php:107
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/transfer'
 */
transfer.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return transfer.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceptionController::transfer
 * @see app/Http/Controllers/ReceptionController.php:107
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/transfer'
 */
transfer.patch = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: transfer.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ReceptionController::transfer
 * @see app/Http/Controllers/ReceptionController.php:107
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/transfer'
 */
    const transferForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfer.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ReceptionController::transfer
 * @see app/Http/Controllers/ReceptionController.php:107
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/reception/transfer'
 */
        transferForm.patch = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transfer.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    transfer.form = transferForm
const reception = {
    index: Object.assign(index, index),
appointments: Object.assign(appointments, appointments),
transfer: Object.assign(transfer, transfer),
patient: Object.assign(patient, patient),
}

export default reception
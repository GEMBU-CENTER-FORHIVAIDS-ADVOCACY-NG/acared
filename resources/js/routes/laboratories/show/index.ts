import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
export const json = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: json.url(args, options),
    method: 'get',
})

json.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/laboratories/{laboratory}/json',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
json.url = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    laboratory: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                laboratory: typeof args.laboratory === 'object'
                ? args.laboratory.id
                : args.laboratory,
                }

    return json.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{laboratory}', parsedArgs.laboratory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
json.get = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: json.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
json.head = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: json.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
    const jsonForm = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: json.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
        jsonForm.get = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: json.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LaboratoryController::json
 * @see app/Http/Controllers/LaboratoryController.php:923
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/laboratories/{laboratory}/json'
 */
        jsonForm.head = (args: { current_team?: string | number, laboratory: number | { id: number } } | [current_team: string | number, laboratory: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: json.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    json.form = jsonForm
const show = {
    json: Object.assign(json, json),
}

export default show
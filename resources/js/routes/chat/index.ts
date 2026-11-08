import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import conversations from './conversations'
/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
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
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:20
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat'
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
const chat = {
    index: Object.assign(index, index),
conversations: Object.assign(conversations, conversations),
}

export default chat
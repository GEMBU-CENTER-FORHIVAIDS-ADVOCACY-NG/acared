import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
import messages from './messages'
/**
* @see \App\Http\Controllers\ChatController::store
 * @see app/Http/Controllers/ChatController.php:109
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/chat/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::store
 * @see app/Http/Controllers/ChatController.php:109
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations'
 */
store.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::store
 * @see app/Http/Controllers/ChatController.php:109
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ChatController::store
 * @see app/Http/Controllers/ChatController.php:109
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ChatController::store
 * @see app/Http/Controllers/ChatController.php:109
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
export const show = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/chat/conversations/{conversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
show.url = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
show.get = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
show.head = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
    const showForm = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
        showForm.get = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/chat/conversations/{conversation}'
 */
        showForm.head = (args: { current_team?: string | number, conversation: number | { id: number } } | [current_team: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const conversations = {
    store: Object.assign(store, store),
show: Object.assign(show, show),
messages: Object.assign(messages, messages),
}

export default conversations
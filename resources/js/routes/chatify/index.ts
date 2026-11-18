import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/chatify',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \Chatify\Http\Controllers\Web\MessengerController::index
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
export const conversation = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})

conversation.definition = {
    methods: ["get","head"],
    url: '/chatify/{conversationId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
conversation.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversationId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    conversationId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        conversationId: args.conversationId,
                }

    return conversation.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
conversation.get = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})
/**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
conversation.head = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversation.url(args, options),
    method: 'head',
})

    /**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
    const conversationForm = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: conversation.url(args, options),
        method: 'get',
    })

            /**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
        conversationForm.get = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: conversation.url(args, options),
            method: 'get',
        })
            /**
* @see \Chatify\Http\Controllers\Web\MessengerController::conversation
 * @see vendor/munafio/chatify/src/Http/Controllers/Web/MessengerController.php:14
 * @route '/chatify/{conversationId}'
 */
        conversationForm.head = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: conversation.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    conversation.form = conversationForm
const chatify = {
    index: Object.assign(index, index),
conversation: Object.assign(conversation, conversation),
}

export default chatify
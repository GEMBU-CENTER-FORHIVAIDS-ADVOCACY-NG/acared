import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \Laradocs\Http\Controllers\AiChatController::__invoke
* @see vendor/petebishwhip/laradocs/src/Http/Controllers/AiChatController.php:38
* @route '/docs/_laradocs/ai/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

chat.definition = {
    methods: ["post"],
    url: '/docs/_laradocs/ai/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laradocs\Http\Controllers\AiChatController::__invoke
* @see vendor/petebishwhip/laradocs/src/Http/Controllers/AiChatController.php:38
* @route '/docs/_laradocs/ai/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\AiChatController::__invoke
* @see vendor/petebishwhip/laradocs/src/Http/Controllers/AiChatController.php:38
* @route '/docs/_laradocs/ai/chat'
*/
chat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

const ai = {
    chat: Object.assign(chat, chat),
}

export default ai
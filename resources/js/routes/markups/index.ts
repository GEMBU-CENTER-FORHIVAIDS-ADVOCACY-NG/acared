import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/markups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
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
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Settings\MarkupController::index
 * @see app/Http/Controllers/Settings/MarkupController.php:15
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
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
* @see \App\Http\Controllers\Settings\MarkupController::store
 * @see app/Http/Controllers/Settings/MarkupController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/markups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\MarkupController::store
 * @see app/Http/Controllers/Settings/MarkupController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
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
* @see \App\Http\Controllers\Settings\MarkupController::store
 * @see app/Http/Controllers/Settings/MarkupController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Settings\MarkupController::store
 * @see app/Http/Controllers/Settings/MarkupController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\MarkupController::store
 * @see app/Http/Controllers/Settings/MarkupController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Settings\MarkupController::update
 * @see app/Http/Controllers/Settings/MarkupController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
export const update = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/markups/{markup}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\MarkupController::update
 * @see app/Http/Controllers/Settings/MarkupController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
update.url = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    markup: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                markup: typeof args.markup === 'object'
                ? args.markup.id
                : args.markup,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{markup}', parsedArgs.markup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\MarkupController::update
 * @see app/Http/Controllers/Settings/MarkupController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
update.patch = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Settings\MarkupController::update
 * @see app/Http/Controllers/Settings/MarkupController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
    const updateForm = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\MarkupController::update
 * @see app/Http/Controllers/Settings/MarkupController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
        updateForm.patch = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Settings\MarkupController::destroy
 * @see app/Http/Controllers/Settings/MarkupController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
export const destroy = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/markups/{markup}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\MarkupController::destroy
 * @see app/Http/Controllers/Settings/MarkupController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
destroy.url = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    markup: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                markup: typeof args.markup === 'object'
                ? args.markup.id
                : args.markup,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{markup}', parsedArgs.markup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\MarkupController::destroy
 * @see app/Http/Controllers/Settings/MarkupController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
destroy.delete = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\MarkupController::destroy
 * @see app/Http/Controllers/Settings/MarkupController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
    const destroyForm = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\MarkupController::destroy
 * @see app/Http/Controllers/Settings/MarkupController.php:58
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/markups/{markup}'
 */
        destroyForm.delete = (args: { current_team?: string | number, markup: number | { id: number } } | [current_team: string | number, markup: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const markups = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default markups
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import subcategories from './subcategories'
/**
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/price-lists',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
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
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LabIntakeController::index
 * @see app/Http/Controllers/LabIntakeController.php:39
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
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
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
export const create = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/price-lists/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
create.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
create.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
create.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
    const createForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
        createForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LabIntakeController::create
 * @see app/Http/Controllers/LabIntakeController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/create'
 */
        createForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\LabIntakeController::store
 * @see app/Http/Controllers/LabIntakeController.php:150
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/price-lists',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LabIntakeController::store
 * @see app/Http/Controllers/LabIntakeController.php:150
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
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
* @see \App\Http\Controllers\LabIntakeController::store
 * @see app/Http/Controllers/LabIntakeController.php:150
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LabIntakeController::store
 * @see app/Http/Controllers/LabIntakeController.php:150
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabIntakeController::store
 * @see app/Http/Controllers/LabIntakeController.php:150
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
export const edit = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/price-lists/{price_list}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
edit.url = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    price_list: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                price_list: typeof args.price_list === 'object'
                ? args.price_list.id
                : args.price_list,
                }

    return edit.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{price_list}', parsedArgs.price_list.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
edit.get = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
edit.head = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
    const editForm = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
        editForm.get = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LabIntakeController::edit
 * @see app/Http/Controllers/LabIntakeController.php:130
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}/edit'
 */
        editForm.head = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\LabIntakeController::update
 * @see app/Http/Controllers/LabIntakeController.php:229
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
export const update = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/price-lists/{price_list}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\LabIntakeController::update
 * @see app/Http/Controllers/LabIntakeController.php:229
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
update.url = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    price_list: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                price_list: typeof args.price_list === 'object'
                ? args.price_list.id
                : args.price_list,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{price_list}', parsedArgs.price_list.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabIntakeController::update
 * @see app/Http/Controllers/LabIntakeController.php:229
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
update.patch = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\LabIntakeController::update
 * @see app/Http/Controllers/LabIntakeController.php:229
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
    const updateForm = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabIntakeController::update
 * @see app/Http/Controllers/LabIntakeController.php:229
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
        updateForm.patch = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\LabIntakeController::destroy
 * @see app/Http/Controllers/LabIntakeController.php:320
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
export const destroy = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/price-lists/{price_list}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LabIntakeController::destroy
 * @see app/Http/Controllers/LabIntakeController.php:320
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
destroy.url = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    price_list: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                price_list: typeof args.price_list === 'object'
                ? args.price_list.id
                : args.price_list,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{price_list}', parsedArgs.price_list.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LabIntakeController::destroy
 * @see app/Http/Controllers/LabIntakeController.php:320
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
destroy.delete = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LabIntakeController::destroy
 * @see app/Http/Controllers/LabIntakeController.php:320
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
    const destroyForm = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LabIntakeController::destroy
 * @see app/Http/Controllers/LabIntakeController.php:320
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/price-lists/{price_list}'
 */
        destroyForm.delete = (args: { current_team?: string | number, price_list: number | { id: number } } | [current_team: string | number, price_list: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const priceLists = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
subcategories: Object.assign(subcategories, subcategories),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default priceLists
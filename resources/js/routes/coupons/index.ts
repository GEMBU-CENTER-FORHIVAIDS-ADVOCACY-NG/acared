import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import patients from './patients'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/coupons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
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
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
    const indexForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
        indexForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CouponController::index
 * @see app/Http/Controllers/CouponController.php:17
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
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
* @see \App\Http\Controllers\CouponController::store
 * @see app/Http/Controllers/CouponController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/coupons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CouponController::store
 * @see app/Http/Controllers/CouponController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
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
* @see \App\Http\Controllers\CouponController::store
 * @see app/Http/Controllers/CouponController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CouponController::store
 * @see app/Http/Controllers/CouponController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
    const storeForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CouponController::store
 * @see app/Http/Controllers/CouponController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons'
 */
        storeForm.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CouponController::approve
 * @see app/Http/Controllers/CouponController.php:90
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/approve'
 */
export const approve = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: approve.url(args, options),
    method: 'patch',
})

approve.definition = {
    methods: ["patch"],
    url: '/{current_team?}/coupons/{coupon}/approve',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CouponController::approve
 * @see app/Http/Controllers/CouponController.php:90
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/approve'
 */
approve.url = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    coupon: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                coupon: typeof args.coupon === 'object'
                ? args.coupon.id
                : args.coupon,
                }

    return approve.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{coupon}', parsedArgs.coupon.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CouponController::approve
 * @see app/Http/Controllers/CouponController.php:90
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/approve'
 */
approve.patch = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: approve.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\CouponController::approve
 * @see app/Http/Controllers/CouponController.php:90
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/approve'
 */
    const approveForm = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CouponController::approve
 * @see app/Http/Controllers/CouponController.php:90
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/approve'
 */
        approveForm.patch = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\CouponController::reject
 * @see app/Http/Controllers/CouponController.php:98
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/reject'
 */
export const reject = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reject.url(args, options),
    method: 'patch',
})

reject.definition = {
    methods: ["patch"],
    url: '/{current_team?}/coupons/{coupon}/reject',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CouponController::reject
 * @see app/Http/Controllers/CouponController.php:98
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/reject'
 */
reject.url = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    coupon: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                coupon: typeof args.coupon === 'object'
                ? args.coupon.id
                : args.coupon,
                }

    return reject.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{coupon}', parsedArgs.coupon.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CouponController::reject
 * @see app/Http/Controllers/CouponController.php:98
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/reject'
 */
reject.patch = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reject.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\CouponController::reject
 * @see app/Http/Controllers/CouponController.php:98
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/reject'
 */
    const rejectForm = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CouponController::reject
 * @see app/Http/Controllers/CouponController.php:98
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}/reject'
 */
        rejectForm.patch = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\CouponController::update
 * @see app/Http/Controllers/CouponController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
export const update = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/coupons/{coupon}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CouponController::update
 * @see app/Http/Controllers/CouponController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
update.url = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    coupon: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                coupon: typeof args.coupon === 'object'
                ? args.coupon.id
                : args.coupon,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{coupon}', parsedArgs.coupon.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CouponController::update
 * @see app/Http/Controllers/CouponController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
update.patch = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\CouponController::update
 * @see app/Http/Controllers/CouponController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
    const updateForm = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CouponController::update
 * @see app/Http/Controllers/CouponController.php:106
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
        updateForm.patch = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\CouponController::destroy
 * @see app/Http/Controllers/CouponController.php:113
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
export const destroy = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/coupons/{coupon}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CouponController::destroy
 * @see app/Http/Controllers/CouponController.php:113
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
destroy.url = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    coupon: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                coupon: typeof args.coupon === 'object'
                ? args.coupon.id
                : args.coupon,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{coupon}', parsedArgs.coupon.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CouponController::destroy
 * @see app/Http/Controllers/CouponController.php:113
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
destroy.delete = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CouponController::destroy
 * @see app/Http/Controllers/CouponController.php:113
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
    const destroyForm = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CouponController::destroy
 * @see app/Http/Controllers/CouponController.php:113
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/coupons/{coupon}'
 */
        destroyForm.delete = (args: { current_team?: string | number, coupon: number | { id: number } } | [current_team: string | number, coupon: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const coupons = {
    index: Object.assign(index, index),
patients: Object.assign(patients, patients),
store: Object.assign(store, store),
approve: Object.assign(approve, approve),
reject: Object.assign(reject, reject),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default coupons
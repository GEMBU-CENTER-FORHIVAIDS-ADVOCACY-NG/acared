import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: login.url(options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
        loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url(options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
        loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    login.form = loginForm
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
    const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: register.url(options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
        registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url(options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
 * @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
 * @route '/register'
 */
        registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    register.form = registerForm
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})
/**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

    /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
    const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: home.url(options),
        method: 'get',
    })

            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
        homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url(options),
            method: 'get',
        })
            /**
* @see \Inertia\Controller::__invoke
 * @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
 * @route '/'
 */
        homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    home.form = homeForm
/**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
export const forbidden = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forbidden.url(options),
    method: 'get',
})

forbidden.definition = {
    methods: ["get","head"],
    url: '/forbidden',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
forbidden.url = (options?: RouteQueryOptions) => {
    return forbidden.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
forbidden.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forbidden.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
forbidden.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forbidden.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
    const forbiddenForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forbidden.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
        forbiddenForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forbidden.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ErrorController::forbidden
 * @see app/Http/Controllers/ErrorController.php:13
 * @route '/forbidden'
 */
        forbiddenForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forbidden.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forbidden.form = forbiddenForm
/**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
export const notFound = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notFound.url(options),
    method: 'get',
})

notFound.definition = {
    methods: ["get","head"],
    url: '/not-found',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
notFound.url = (options?: RouteQueryOptions) => {
    return notFound.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
notFound.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notFound.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
notFound.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notFound.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
    const notFoundForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notFound.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
        notFoundForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notFound.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ErrorController::notFound
 * @see app/Http/Controllers/ErrorController.php:21
 * @route '/not-found'
 */
        notFoundForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notFound.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notFound.form = notFoundForm
/**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
export const pageExpired = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pageExpired.url(options),
    method: 'get',
})

pageExpired.definition = {
    methods: ["get","head"],
    url: '/page-expired',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
pageExpired.url = (options?: RouteQueryOptions) => {
    return pageExpired.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
pageExpired.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pageExpired.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
pageExpired.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pageExpired.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
    const pageExpiredForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pageExpired.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
        pageExpiredForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pageExpired.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ErrorController::pageExpired
 * @see app/Http/Controllers/ErrorController.php:29
 * @route '/page-expired'
 */
        pageExpiredForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pageExpired.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pageExpired.form = pageExpiredForm
/**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
export const tooManyRequests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tooManyRequests.url(options),
    method: 'get',
})

tooManyRequests.definition = {
    methods: ["get","head"],
    url: '/too-many-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
tooManyRequests.url = (options?: RouteQueryOptions) => {
    return tooManyRequests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
tooManyRequests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tooManyRequests.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
tooManyRequests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tooManyRequests.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
    const tooManyRequestsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: tooManyRequests.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
        tooManyRequestsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tooManyRequests.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ErrorController::tooManyRequests
 * @see app/Http/Controllers/ErrorController.php:37
 * @route '/too-many-requests'
 */
        tooManyRequestsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tooManyRequests.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    tooManyRequests.form = tooManyRequestsForm
/**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
export const serverError = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serverError.url(options),
    method: 'get',
})

serverError.definition = {
    methods: ["get","head"],
    url: '/server-error',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
serverError.url = (options?: RouteQueryOptions) => {
    return serverError.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
serverError.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serverError.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
serverError.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: serverError.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
    const serverErrorForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: serverError.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
        serverErrorForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serverError.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ErrorController::serverError
 * @see app/Http/Controllers/ErrorController.php:45
 * @route '/server-error'
 */
        serverErrorForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serverError.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    serverError.form = serverErrorForm
/**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
export const serviceUnavailable = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serviceUnavailable.url(options),
    method: 'get',
})

serviceUnavailable.definition = {
    methods: ["get","head"],
    url: '/service-unavailable',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
serviceUnavailable.url = (options?: RouteQueryOptions) => {
    return serviceUnavailable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
serviceUnavailable.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serviceUnavailable.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
serviceUnavailable.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: serviceUnavailable.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
    const serviceUnavailableForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: serviceUnavailable.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
        serviceUnavailableForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serviceUnavailable.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ErrorController::serviceUnavailable
 * @see app/Http/Controllers/ErrorController.php:53
 * @route '/service-unavailable'
 */
        serviceUnavailableForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: serviceUnavailable.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    serviceUnavailable.form = serviceUnavailableForm
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
export const dashboard = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
dashboard.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return dashboard.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
dashboard.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
dashboard.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
    const dashboardForm = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
        dashboardForm.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::__invoke
 * @see app/Http/Controllers/DashboardController.php:26
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/dashboard'
 */
        dashboardForm.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
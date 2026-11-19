import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Teams\TeamUserController::index
 * @see app/Http/Controllers/Teams/TeamUserController.php:23
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
export const index = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/teams/{team?}/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teams\TeamUserController::index
 * @see app/Http/Controllers/Teams/TeamUserController.php:23
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
index.url = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
            args = { team: args.slug }
        }
    
    if (Array.isArray(args)) {
        args = {
                    team: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "team",
        ])

    const parsedArgs = {
                        team: (typeof args?.team === 'object'
                ? args.team.slug
                : args?.team) ?? '$currentTeam',
                }

    return index.definition.url
            .replace('{team?}', parsedArgs.team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamUserController::index
 * @see app/Http/Controllers/Teams/TeamUserController.php:23
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
index.get = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teams\TeamUserController::index
 * @see app/Http/Controllers/Teams/TeamUserController.php:23
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
index.head = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Teams\TeamUserController::store
 * @see app/Http/Controllers/Teams/TeamUserController.php:77
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
export const store = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/teams/{team?}/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teams\TeamUserController::store
 * @see app/Http/Controllers/Teams/TeamUserController.php:77
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
store.url = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { team: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
            args = { team: args.slug }
        }
    
    if (Array.isArray(args)) {
        args = {
                    team: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "team",
        ])

    const parsedArgs = {
                        team: (typeof args?.team === 'object'
                ? args.team.slug
                : args?.team) ?? '$currentTeam',
                }

    return store.definition.url
            .replace('{team?}', parsedArgs.team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamUserController::store
 * @see app/Http/Controllers/Teams/TeamUserController.php:77
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users'
 */
store.post = (args?: { team?: string | { slug: string } } | [team: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Teams\TeamUserController::update
 * @see app/Http/Controllers/Teams/TeamUserController.php:107
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users/{user}'
 */
export const update = (args: { team?: string | { slug: string }, user: number | { id: number } } | [team: string | { slug: string }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/teams/{team?}/users/{user}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Teams\TeamUserController::update
 * @see app/Http/Controllers/Teams/TeamUserController.php:107
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users/{user}'
 */
update.url = (args: { team?: string | { slug: string }, user: number | { id: number } } | [team: string | { slug: string }, user: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    team: args[0],
                    user: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "team",
        ])

    const parsedArgs = {
                        team: (typeof args.team === 'object'
                ? args.team.slug
                : args.team) ?? '$currentTeam',
                                user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return update.definition.url
            .replace('{team?}', parsedArgs.team?.toString() ?? '')
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamUserController::update
 * @see app/Http/Controllers/Teams/TeamUserController.php:107
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users/{user}'
 */
update.patch = (args: { team?: string | { slug: string }, user: number | { id: number } } | [team: string | { slug: string }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Teams\TeamUserController::destroy
 * @see app/Http/Controllers/Teams/TeamUserController.php:137
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users/{user}'
 */
export const destroy = (args: { team?: string | { slug: string }, user: number | { id: number } } | [team: string | { slug: string }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/teams/{team?}/users/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teams\TeamUserController::destroy
 * @see app/Http/Controllers/Teams/TeamUserController.php:137
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users/{user}'
 */
destroy.url = (args: { team?: string | { slug: string }, user: number | { id: number } } | [team: string | { slug: string }, user: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    team: args[0],
                    user: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "team",
        ])

    const parsedArgs = {
                        team: (typeof args.team === 'object'
                ? args.team.slug
                : args.team) ?? '$currentTeam',
                                user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return destroy.definition.url
            .replace('{team?}', parsedArgs.team?.toString() ?? '')
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamUserController::destroy
 * @see app/Http/Controllers/Teams/TeamUserController.php:137
 * @param team - Default: '$currentTeam'
 * @route '/settings/teams/{team?}/users/{user}'
 */
destroy.delete = (args: { team?: string | { slug: string }, user: number | { id: number } } | [team: string | { slug: string }, user: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const users = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default users
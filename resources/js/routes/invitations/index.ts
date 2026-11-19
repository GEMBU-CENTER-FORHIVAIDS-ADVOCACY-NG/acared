import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Teams\TeamInvitationController::accept
 * @see app/Http/Controllers/Teams/TeamInvitationController.php:61
 * @route '/invitations/{invitation}/accept'
 */
export const accept = (args: { invitation: string | { code: string } } | [invitation: string | { code: string } ] | string | { code: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/invitations/{invitation}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teams\TeamInvitationController::accept
 * @see app/Http/Controllers/Teams/TeamInvitationController.php:61
 * @route '/invitations/{invitation}/accept'
 */
accept.url = (args: { invitation: string | { code: string } } | [invitation: string | { code: string } ] | string | { code: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invitation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'code' in args) {
            args = { invitation: args.code }
        }
    
    if (Array.isArray(args)) {
        args = {
                    invitation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        invitation: typeof args.invitation === 'object'
                ? args.invitation.code
                : args.invitation,
                }

    return accept.definition.url
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamInvitationController::accept
 * @see app/Http/Controllers/Teams/TeamInvitationController.php:61
 * @route '/invitations/{invitation}/accept'
 */
accept.post = (args: { invitation: string | { code: string } } | [invitation: string | { code: string } ] | string | { code: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Teams\TeamInvitationController::decline
 * @see app/Http/Controllers/Teams/TeamInvitationController.php:86
 * @route '/invitations/{invitation}'
 */
export const decline = (args: { invitation: string | { code: string } } | [invitation: string | { code: string } ] | string | { code: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: decline.url(args, options),
    method: 'delete',
})

decline.definition = {
    methods: ["delete"],
    url: '/invitations/{invitation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teams\TeamInvitationController::decline
 * @see app/Http/Controllers/Teams/TeamInvitationController.php:86
 * @route '/invitations/{invitation}'
 */
decline.url = (args: { invitation: string | { code: string } } | [invitation: string | { code: string } ] | string | { code: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invitation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'code' in args) {
            args = { invitation: args.code }
        }
    
    if (Array.isArray(args)) {
        args = {
                    invitation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        invitation: typeof args.invitation === 'object'
                ? args.invitation.code
                : args.invitation,
                }

    return decline.definition.url
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teams\TeamInvitationController::decline
 * @see app/Http/Controllers/Teams/TeamInvitationController.php:86
 * @route '/invitations/{invitation}'
 */
decline.delete = (args: { invitation: string | { code: string } } | [invitation: string | { code: string } ] | string | { code: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: decline.url(args, options),
    method: 'delete',
})
const invitations = {
    accept: Object.assign(accept, accept),
decline: Object.assign(decline, decline),
}

export default invitations
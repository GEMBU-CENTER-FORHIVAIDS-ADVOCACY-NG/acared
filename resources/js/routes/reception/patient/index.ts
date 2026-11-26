import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ReceptionController::card
* @see app/Http/Controllers/ReceptionController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reception/appointments/{appointment}/card/{type}'
*/
export const card = (args: { current_team?: string | number, appointment: string | number, type: string | number } | [current_team: string | number, appointment: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: card.url(args, options),
    method: 'get',
})

card.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/reception/appointments/{appointment}/card/{type}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReceptionController::card
* @see app/Http/Controllers/ReceptionController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reception/appointments/{appointment}/card/{type}'
*/
card.url = (args: { current_team?: string | number, appointment: string | number, type: string | number } | [current_team: string | number, appointment: string | number, type: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            current_team: args[0],
            appointment: args[1],
            type: args[2],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "current_team",
    ])

    const parsedArgs = {
        current_team: args.current_team ?? '$currentTeam',
        appointment: args.appointment,
        type: args.type,
    }

    return card.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{appointment}', parsedArgs.appointment.toString())
            .replace('{type}', parsedArgs.type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReceptionController::card
* @see app/Http/Controllers/ReceptionController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reception/appointments/{appointment}/card/{type}'
*/
card.get = (args: { current_team?: string | number, appointment: string | number, type: string | number } | [current_team: string | number, appointment: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: card.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReceptionController::card
* @see app/Http/Controllers/ReceptionController.php:79
* @param current_team - Default: '$currentTeam'
* @route '/{current_team?}/reception/appointments/{appointment}/card/{type}'
*/
card.head = (args: { current_team?: string | number, appointment: string | number, type: string | number } | [current_team: string | number, appointment: string | number, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: card.url(args, options),
    method: 'head',
})

const patient = {
    card: Object.assign(card, card),
}

export default patient
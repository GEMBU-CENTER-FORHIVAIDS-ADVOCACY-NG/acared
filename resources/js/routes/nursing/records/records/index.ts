import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ConsultationRecordController::store
 * @see app/Http/Controllers/ConsultationRecordController.php:185
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}'
 */
export const store = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/nursing/records/{nursing}/records/{type}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConsultationRecordController::store
 * @see app/Http/Controllers/ConsultationRecordController.php:185
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}'
 */
store.url = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    type: args[2],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                                type: args.type,
                }

    return store.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{type}', parsedArgs.type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationRecordController::store
 * @see app/Http/Controllers/ConsultationRecordController.php:185
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}'
 */
store.post = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConsultationRecordController::update
 * @see app/Http/Controllers/ConsultationRecordController.php:197
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}'
 */
export const update = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number, record: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number, record: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConsultationRecordController::update
 * @see app/Http/Controllers/ConsultationRecordController.php:197
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}'
 */
update.url = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number, record: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number, record: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    type: args[2],
                    record: args[3],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                                type: args.type,
                                record: args.record,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{type}', parsedArgs.type.toString())
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationRecordController::update
 * @see app/Http/Controllers/ConsultationRecordController.php:197
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}'
 */
update.patch = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number, record: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number, record: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ConsultationRecordController::destroy
 * @see app/Http/Controllers/ConsultationRecordController.php:209
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}'
 */
export const destroy = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number, record: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number, record: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConsultationRecordController::destroy
 * @see app/Http/Controllers/ConsultationRecordController.php:209
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}'
 */
destroy.url = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number, record: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number, record: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    nursing: args[1],
                    type: args[2],
                    record: args[3],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                nursing: typeof args.nursing === 'object'
                ? args.nursing.id
                : args.nursing,
                                type: args.type,
                                record: args.record,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{nursing}', parsedArgs.nursing.toString())
            .replace('{type}', parsedArgs.type.toString())
            .replace('{record}', parsedArgs.record.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsultationRecordController::destroy
 * @see app/Http/Controllers/ConsultationRecordController.php:209
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/nursing/records/{nursing}/records/{type}/{record}'
 */
destroy.delete = (args: { current_team?: string | number, nursing: number | { id: number }, type: string | number, record: string | number } | [current_team: string | number, nursing: number | { id: number }, type: string | number, record: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const records = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default records
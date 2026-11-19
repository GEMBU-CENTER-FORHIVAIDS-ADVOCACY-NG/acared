import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import bulk from './bulk'
/**
* @see \App\Http\Controllers\PatientController::index
 * @see app/Http/Controllers/PatientController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/patients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatientController::index
 * @see app/Http/Controllers/PatientController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
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
* @see \App\Http\Controllers\PatientController::index
 * @see app/Http/Controllers/PatientController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PatientController::index
 * @see app/Http/Controllers/PatientController.php:38
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatientImportExportController::exportMethod
 * @see app/Http/Controllers/PatientImportExportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/export'
 */
export const exportMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/patients/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatientImportExportController::exportMethod
 * @see app/Http/Controllers/PatientImportExportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/export'
 */
exportMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientImportExportController::exportMethod
 * @see app/Http/Controllers/PatientImportExportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/export'
 */
exportMethod.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PatientImportExportController::exportMethod
 * @see app/Http/Controllers/PatientImportExportController.php:27
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/export'
 */
exportMethod.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatientImportExportController::importMethod
 * @see app/Http/Controllers/PatientImportExportController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/import'
 */
export const importMethod = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/{current_team?}/patients/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PatientImportExportController::importMethod
 * @see app/Http/Controllers/PatientImportExportController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/import'
 */
importMethod.url = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return importMethod.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientImportExportController::importMethod
 * @see app/Http/Controllers/PatientImportExportController.php:82
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/import'
 */
importMethod.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PatientController::create
 * @see app/Http/Controllers/PatientController.php:68
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/create'
 */
export const create = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/patients/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatientController::create
 * @see app/Http/Controllers/PatientController.php:68
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/create'
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
* @see \App\Http\Controllers\PatientController::create
 * @see app/Http/Controllers/PatientController.php:68
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/create'
 */
create.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PatientController::create
 * @see app/Http/Controllers/PatientController.php:68
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/create'
 */
create.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatientController::store
 * @see app/Http/Controllers/PatientController.php:89
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/patients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PatientController::store
 * @see app/Http/Controllers/PatientController.php:89
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
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
* @see \App\Http\Controllers\PatientController::store
 * @see app/Http/Controllers/PatientController.php:89
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PatientController::show
 * @see app/Http/Controllers/PatientController.php:151
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
export const show = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/patients/{patient}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatientController::show
 * @see app/Http/Controllers/PatientController.php:151
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
show.url = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    patient: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return show.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientController::show
 * @see app/Http/Controllers/PatientController.php:151
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
show.get = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PatientController::show
 * @see app/Http/Controllers/PatientController.php:151
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
show.head = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatientController::edit
 * @see app/Http/Controllers/PatientController.php:161
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/edit'
 */
export const edit = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/patients/{patient}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatientController::edit
 * @see app/Http/Controllers/PatientController.php:161
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/edit'
 */
edit.url = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    patient: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return edit.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientController::edit
 * @see app/Http/Controllers/PatientController.php:161
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/edit'
 */
edit.get = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PatientController::edit
 * @see app/Http/Controllers/PatientController.php:161
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/edit'
 */
edit.head = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatientController::update
 * @see app/Http/Controllers/PatientController.php:172
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
export const update = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/patients/{patient}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PatientController::update
 * @see app/Http/Controllers/PatientController.php:172
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
update.url = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    patient: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientController::update
 * @see app/Http/Controllers/PatientController.php:172
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
update.patch = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PatientController::destroy
 * @see app/Http/Controllers/PatientController.php:184
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
export const destroy = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/patients/{patient}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PatientController::destroy
 * @see app/Http/Controllers/PatientController.php:184
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
destroy.url = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    patient: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientController::destroy
 * @see app/Http/Controllers/PatientController.php:184
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}'
 */
destroy.delete = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PatientController::restore
 * @see app/Http/Controllers/PatientController.php:196
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/restore'
 */
export const restore = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: restore.url(args, options),
    method: 'patch',
})

restore.definition = {
    methods: ["patch"],
    url: '/{current_team?}/patients/{patient}/restore',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PatientController::restore
 * @see app/Http/Controllers/PatientController.php:196
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/restore'
 */
restore.url = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    patient: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return restore.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientController::restore
 * @see app/Http/Controllers/PatientController.php:196
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/restore'
 */
restore.patch = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: restore.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PatientController::forceDelete
 * @see app/Http/Controllers/PatientController.php:208
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/force'
 */
export const forceDelete = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})

forceDelete.definition = {
    methods: ["delete"],
    url: '/{current_team?}/patients/{patient}/force',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PatientController::forceDelete
 * @see app/Http/Controllers/PatientController.php:208
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/force'
 */
forceDelete.url = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    patient: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return forceDelete.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientController::forceDelete
 * @see app/Http/Controllers/PatientController.php:208
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/patients/{patient}/force'
 */
forceDelete.delete = (args: { current_team?: string | number, patient: number | { id: number } } | [current_team: string | number, patient: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDelete.url(args, options),
    method: 'delete',
})
const patients = {
    index: Object.assign(index, index),
export: Object.assign(exportMethod, exportMethod),
import: Object.assign(importMethod, importMethod),
create: Object.assign(create, create),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
restore: Object.assign(restore, restore),
forceDelete: Object.assign(forceDelete, forceDelete),
}

export default patients
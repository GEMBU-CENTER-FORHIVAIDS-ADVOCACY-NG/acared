import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PatientApiController::index
* @see app/Http/Controllers/Api/PatientApiController.php:12
* @route '/api/patients'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/patients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PatientApiController::index
* @see app/Http/Controllers/Api/PatientApiController.php:12
* @route '/api/patients'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PatientApiController::index
* @see app/Http/Controllers/Api/PatientApiController.php:12
* @route '/api/patients'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PatientApiController::index
* @see app/Http/Controllers/Api/PatientApiController.php:12
* @route '/api/patients'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PatientApiController::show
* @see app/Http/Controllers/Api/PatientApiController.php:35
* @route '/api/patients/{patient}'
*/
export const show = (args: { patient: number | { id: number } } | [patient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/patients/{patient}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PatientApiController::show
* @see app/Http/Controllers/Api/PatientApiController.php:35
* @route '/api/patients/{patient}'
*/
show.url = (args: { patient: number | { id: number } } | [patient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patient: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { patient: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            patient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        patient: typeof args.patient === 'object'
        ? args.patient.id
        : args.patient,
    }

    return show.definition.url
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PatientApiController::show
* @see app/Http/Controllers/Api/PatientApiController.php:35
* @route '/api/patients/{patient}'
*/
show.get = (args: { patient: number | { id: number } } | [patient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PatientApiController::show
* @see app/Http/Controllers/Api/PatientApiController.php:35
* @route '/api/patients/{patient}'
*/
show.head = (args: { patient: number | { id: number } } | [patient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PatientApiController::store
* @see app/Http/Controllers/Api/PatientApiController.php:48
* @route '/api/patients'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/patients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PatientApiController::store
* @see app/Http/Controllers/Api/PatientApiController.php:48
* @route '/api/patients'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PatientApiController::store
* @see app/Http/Controllers/Api/PatientApiController.php:48
* @route '/api/patients'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const patients = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    store: Object.assign(store, store),
}

export default patients
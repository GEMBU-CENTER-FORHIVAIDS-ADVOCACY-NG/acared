import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::index
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:18
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
 */
export const index = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/{current_team?}/pharmacy/drug-forms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::index
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:18
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
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
* @see \App\Http\Controllers\Pharmacy\DrugFormController::index
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:18
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
 */
index.get = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::index
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:18
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
 */
index.head = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::store
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
 */
export const store = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/{current_team?}/pharmacy/drug-forms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::store
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
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
* @see \App\Http\Controllers\Pharmacy\DrugFormController::store
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:50
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms'
 */
store.post = (args?: { current_team?: string | number } | [current_team: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::update
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms/{drug_form}'
 */
export const update = (args: { current_team?: string | number, drug_form: number | { id: number } } | [current_team: string | number, drug_form: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/{current_team?}/pharmacy/drug-forms/{drug_form}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::update
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms/{drug_form}'
 */
update.url = (args: { current_team?: string | number, drug_form: number | { id: number } } | [current_team: string | number, drug_form: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    drug_form: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                drug_form: typeof args.drug_form === 'object'
                ? args.drug_form.id
                : args.drug_form,
                }

    return update.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{drug_form}', parsedArgs.drug_form.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::update
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:67
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms/{drug_form}'
 */
update.patch = (args: { current_team?: string | number, drug_form: number | { id: number } } | [current_team: string | number, drug_form: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::destroy
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms/{drug_form}'
 */
export const destroy = (args: { current_team?: string | number, drug_form: number | { id: number } } | [current_team: string | number, drug_form: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/{current_team?}/pharmacy/drug-forms/{drug_form}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::destroy
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms/{drug_form}'
 */
destroy.url = (args: { current_team?: string | number, drug_form: number | { id: number } } | [current_team: string | number, drug_form: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    current_team: args[0],
                    drug_form: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "current_team",
        ])

    const parsedArgs = {
                        current_team: args.current_team ?? '$currentTeam',
                                drug_form: typeof args.drug_form === 'object'
                ? args.drug_form.id
                : args.drug_form,
                }

    return destroy.definition.url
            .replace('{current_team?}', parsedArgs.current_team?.toString() ?? '')
            .replace('{drug_form}', parsedArgs.drug_form.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Pharmacy\DrugFormController::destroy
 * @see app/Http/Controllers/Pharmacy/DrugFormController.php:79
 * @param current_team - Default: '$currentTeam'
 * @route '/{current_team?}/pharmacy/drug-forms/{drug_form}'
 */
destroy.delete = (args: { current_team?: string | number, drug_form: number | { id: number } } | [current_team: string | number, drug_form: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const drugForms = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default drugForms
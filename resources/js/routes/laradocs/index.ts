import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import api from './api'
import ai from './ai'
import tags from './tags'
/**
* @see \Laradocs\Http\Controllers\RobotsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/RobotsController.php:14
 * @route '/docs/robots.txt'
 */
export const robots = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: robots.url(options),
    method: 'get',
})

robots.definition = {
    methods: ["get","head"],
    url: '/docs/robots.txt',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\RobotsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/RobotsController.php:14
 * @route '/docs/robots.txt'
 */
robots.url = (options?: RouteQueryOptions) => {
    return robots.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\RobotsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/RobotsController.php:14
 * @route '/docs/robots.txt'
 */
robots.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: robots.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\RobotsController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/RobotsController.php:14
 * @route '/docs/robots.txt'
 */
robots.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: robots.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\DocsController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:26
 * @route '/docs'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\DocsController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:26
 * @route '/docs'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\DocsController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:26
 * @route '/docs'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\DocsController::index
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:26
 * @route '/docs'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\SitemapController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SitemapController.php:16
 * @route '/docs/sitemap.xml'
 */
export const sitemap = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sitemap.url(options),
    method: 'get',
})

sitemap.definition = {
    methods: ["get","head"],
    url: '/docs/sitemap.xml',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\SitemapController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SitemapController.php:16
 * @route '/docs/sitemap.xml'
 */
sitemap.url = (options?: RouteQueryOptions) => {
    return sitemap.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\SitemapController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SitemapController.php:16
 * @route '/docs/sitemap.xml'
 */
sitemap.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sitemap.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\SitemapController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SitemapController.php:16
 * @route '/docs/sitemap.xml'
 */
sitemap.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sitemap.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\FeedController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/FeedController.php:18
 * @route '/docs/feed.xml'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/docs/feed.xml',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\FeedController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/FeedController.php:18
 * @route '/docs/feed.xml'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\FeedController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/FeedController.php:18
 * @route '/docs/feed.xml'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\FeedController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/FeedController.php:18
 * @route '/docs/feed.xml'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\LlmsTxtController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LlmsTxtController.php:16
 * @route '/docs/llms.txt'
 */
export const llms = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: llms.url(options),
    method: 'get',
})

llms.definition = {
    methods: ["get","head"],
    url: '/docs/llms.txt',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\LlmsTxtController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LlmsTxtController.php:16
 * @route '/docs/llms.txt'
 */
llms.url = (options?: RouteQueryOptions) => {
    return llms.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\LlmsTxtController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LlmsTxtController.php:16
 * @route '/docs/llms.txt'
 */
llms.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: llms.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\LlmsTxtController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LlmsTxtController.php:16
 * @route '/docs/llms.txt'
 */
llms.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: llms.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\AssetController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/AssetController.php:24
 * @route '/docs/_laradocs/asset/{file}'
 */
export const asset = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: asset.url(args, options),
    method: 'get',
})

asset.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/asset/{file}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\AssetController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/AssetController.php:24
 * @route '/docs/_laradocs/asset/{file}'
 */
asset.url = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    file: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        file: args.file,
                }

    return asset.definition.url
            .replace('{file}', parsedArgs.file.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\AssetController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/AssetController.php:24
 * @route '/docs/_laradocs/asset/{file}'
 */
asset.get = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: asset.url(args, options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\AssetController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/AssetController.php:24
 * @route '/docs/_laradocs/asset/{file}'
 */
asset.head = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: asset.url(args, options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\MediaController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/MediaController.php:30
 * @route '/docs/_media/{path}'
 */
export const media = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: media.url(args, options),
    method: 'get',
})

media.definition = {
    methods: ["get","head"],
    url: '/docs/_media/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\MediaController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/MediaController.php:30
 * @route '/docs/_media/{path}'
 */
media.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    path: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        path: args.path,
                }

    return media.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\MediaController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/MediaController.php:30
 * @route '/docs/_media/{path}'
 */
media.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: media.url(args, options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\MediaController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/MediaController.php:30
 * @route '/docs/_media/{path}'
 */
media.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: media.url(args, options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\SearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SearchController.php:27
 * @route '/docs/_laradocs/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\SearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SearchController.php:27
 * @route '/docs/_laradocs/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\SearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SearchController.php:27
 * @route '/docs/_laradocs/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\SearchController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/SearchController.php:27
 * @route '/docs/_laradocs/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\LocaleConsentController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LocaleConsentController.php:24
 * @route '/docs/_laradocs/consent'
 */
export const consent = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: consent.url(options),
    method: 'get',
})

consent.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/consent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\LocaleConsentController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LocaleConsentController.php:24
 * @route '/docs/_laradocs/consent'
 */
consent.url = (options?: RouteQueryOptions) => {
    return consent.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\LocaleConsentController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LocaleConsentController.php:24
 * @route '/docs/_laradocs/consent'
 */
consent.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: consent.url(options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\LocaleConsentController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/LocaleConsentController.php:24
 * @route '/docs/_laradocs/consent'
 */
consent.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: consent.url(options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og/{path}'
 */
export const og = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: og.url(args, options),
    method: 'get',
})

og.definition = {
    methods: ["get","head"],
    url: '/docs/_laradocs/og/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og/{path}'
 */
og.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    path: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        path: args.path,
                }

    return og.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og/{path}'
 */
og.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: og.url(args, options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\OgImageController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/OgImageController.php:36
 * @route '/docs/_laradocs/og/{path}'
 */
og.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: og.url(args, options),
    method: 'head',
})

/**
* @see \Laradocs\Http\Controllers\McpController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/McpController.php:16
 * @route '/docs/mcp'
 */
export const mcp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mcp.url(options),
    method: 'post',
})

mcp.definition = {
    methods: ["post"],
    url: '/docs/mcp',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laradocs\Http\Controllers\McpController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/McpController.php:16
 * @route '/docs/mcp'
 */
mcp.url = (options?: RouteQueryOptions) => {
    return mcp.definition.url + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\McpController::__invoke
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/McpController.php:16
 * @route '/docs/mcp'
 */
mcp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mcp.url(options),
    method: 'post',
})

/**
* @see \Laradocs\Http\Controllers\DocsController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:46
 * @route '/docs/{path}'
 */
export const show = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/docs/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laradocs\Http\Controllers\DocsController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:46
 * @route '/docs/{path}'
 */
show.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    path: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        path: args.path,
                }

    return show.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laradocs\Http\Controllers\DocsController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:46
 * @route '/docs/{path}'
 */
show.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \Laradocs\Http\Controllers\DocsController::show
 * @see vendor/petebishwhip/laradocs/src/Http/Controllers/DocsController.php:46
 * @route '/docs/{path}'
 */
show.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})
const laradocs = {
    robots: Object.assign(robots, robots),
index: Object.assign(index, index),
sitemap: Object.assign(sitemap, sitemap),
feed: Object.assign(feed, feed),
llms: Object.assign(llms, llms),
asset: Object.assign(asset, asset),
media: Object.assign(media, media),
search: Object.assign(search, search),
consent: Object.assign(consent, consent),
og: Object.assign(og, og),
api: Object.assign(api, api),
ai: Object.assign(ai, ai),
mcp: Object.assign(mcp, mcp),
tags: Object.assign(tags, tags),
show: Object.assign(show, show),
}

export default laradocs
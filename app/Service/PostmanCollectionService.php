<?php

namespace App\Service;

use Symfony\Component\Yaml\Yaml;

class PostmanCollectionService
{
    public const COLLECTION_SCHEMA = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

    public function __construct(
        protected ?string $specPath = null,
    ) {}

    /**
     * Resolve the OpenAPI spec path, defaulting to the repo's generated spec.
     */
    protected function resolveSpecPath(string $path): string
    {
        return $path ?: base_path('docs/openapi.yaml');
    }

    /**
     * Convert the OpenAPI spec into a Postman Collection v2.1 array.
     */
    public function toCollection(?string $specPath = null): array
    {
        $path = $this->resolveSpecPath($specPath ?? $this->specPath ?? '');

        if (! is_file($path)) {
            throw new \RuntimeException("OpenAPI spec not found at [{$path}].");
        }

        $spec = Yaml::parseFile($path);

        $title = $spec['info']['title'] ?? 'API';
        $description = $spec['info']['description'] ?? null;
        $version = $spec['info']['version'] ?? '1.0.0';

        $serverUrl = $spec['servers'][0]['url'] ?? url('/');
        $serverUrl = rtrim((string) $serverUrl, '/');

        $collection = [
            'info' => [
                'name' => (string) $title,
                'description' => $description,
                'schema' => self::COLLECTION_SCHEMA,
                '_postman_id' => self::uuid(),
            ],
            'variable' => [
                [
                    'key' => 'baseUrl',
                    'value' => $serverUrl,
                    'type' => 'string',
                ],
            ],
        ];

        $collectionAuth = $this->buildAuth($spec['security'] ?? []);
        if ($collectionAuth !== null) {
            $collection['auth'] = $collectionAuth;
        }

        $paths = $spec['paths'] ?? [];

        // Group operations under a folder (folder per tag), preserving order.
        $folders = [];
        $folderOrder = [];

        foreach ($paths as $path => $pathItem) {
            foreach ($pathItem as $method => $operation) {
                if (! in_array(strtoupper($method), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], true)) {
                    continue;
                }

                $tags = $operation['tags'] ?? [];
                $tag = $tags[0] ?? 'Default';

                if (! array_key_exists($tag, $folderOrder)) {
                    $folderOrder[$tag] = true;
                    $folders[$tag] = [];
                }

                $request = $this->buildRequest($path, strtoupper($method), $operation, $spec);

                $requestItem = [
                    'name' => $operation['summary'] ?? sprintf('%s %s', strtoupper($method), $path),
                    'request' => $request,
                ];

                if (! empty($operation['description'])) {
                    $requestItem['description'] = $operation['description'];
                }

                $folders[$tag][] = $requestItem;
            }
        }

        $collection['item'] = array_map(
            fn (string $tag): array => ['name' => $tag, 'item' => $folders[$tag]],
            array_keys($folderOrder),
        );

        return $collection;
    }

    /**
     * Build a Postman request object from an OpenAPI operation.
     */
    protected function buildRequest(string $path, string $method, array $operation, array $spec): array
    {
        $parameters = $operation['parameters'] ?? [];

        $headers = [];
        $query = [];
        $variables = [];

        foreach ($parameters as $parameter) {
            $name = $parameter['name'];
            $in = $parameter['in'];

            if ($in === 'path') {
                $variables[] = [
                    'key' => $name,
                    'value' => $parameter['example'] ?? $parameter['schema']['example'] ?? '',
                    'description' => $parameter['description'] ?? null,
                ];
            } elseif ($in === 'query') {
                $query[] = [
                    'key' => $name,
                    'value' => $parameter['example'] ?? $parameter['schema']['example'] ?? '',
                    'description' => $parameter['description'] ?? null,
                    'disabled' => ! ($parameter['required'] ?? false),
                ];
            } elseif ($in === 'header') {
                $headers[] = [
                    'key' => $name,
                    'value' => $parameter['example'] ?? $parameter['schema']['example'] ?? '',
                    'description' => $parameter['description'] ?? null,
                    'disabled' => ! ($parameter['required'] ?? false),
                ];
            }
        }

        $body = null;
        if (isset($operation['requestBody']['content']['application/json'])) {
            $media = $operation['requestBody']['content']['application/json'];
            $schema = $media['schema'] ?? null;
            $example = $this->buildExample($schema, $spec);

            $body = [
                'mode' => 'raw',
                'raw' => $example !== null ? json_encode($example, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) : '{}',
                'options' => ['raw' => ['language' => 'json']],
            ];

            if (! $this->hasHeader($headers, 'Content-Type')) {
                $headers[] = ['key' => 'Content-Type', 'value' => 'application/json'];
            }
        }

        $urlRaw = '{{baseUrl}}'.$path;
        $url = [
            'raw' => $urlRaw,
            'host' => ['{{baseUrl}}'],
            'path' => self::splitPath($path),
            'query' => $query,
        ];
        if ($variables !== []) {
            $url['variable'] = $variables;
        }

        $request = [
            'method' => $method,
            'header' => $headers,
            'url' => $url,
        ];

        if ($body !== null) {
            $request['body'] = $body;
        }

        return $request;
    }

    /**
     * Resolve a schema node (handling $ref, allOf, anyOf, oneOf) into example values.
     */
    protected function buildExample(?array $schema, array $spec, int $depth = 0): mixed
    {
        if ($schema === null) {
            return null;
        }

        if ($depth > 8) {
            return null;
        }

        if (isset($schema['$ref'])) {
            $name = ltrim($schema['$ref'], '#/');
            $parts = explode('/', $name);

            $resolved = $spec;
            foreach ($parts as $part) {
                $resolved = $resolved[$part] ?? null;
                if ($resolved === null) {
                    break;
                }
            }

            return $this->buildExample($resolved, $spec, $depth + 1);
        }

        if (isset($schema['allOf']) && is_array($schema['allOf'])) {
            $merged = [];
            foreach ($schema['allOf'] as $sub) {
                $resolved = $this->buildExample($sub, $spec, $depth + 1);
                if (is_array($resolved)) {
                    $merged = array_merge($merged, $resolved);
                }
            }

            return $merged;
        }

        if (isset($schema['oneOf']) && is_array($schema['oneOf'])) {
            return $this->buildExample($schema['oneOf'][0] ?? null, $spec, $depth + 1);
        }

        if (isset($schema['anyOf']) && is_array($schema['anyOf'])) {
            return $this->buildExample($schema['anyOf'][0] ?? null, $spec, $depth + 1);
        }

        if (array_key_exists('example', $schema)) {
            return $schema['example'];
        }

        if (array_key_exists('default', $schema)) {
            return $schema['default'];
        }

        $type = $schema['type'] ?? null;

        if (is_array($type)) {
            $type = $type[0] ?? 'string';
        }

        if ($type === null) {
            // Derive from properties / items presence.
            if (isset($schema['properties'])) {
                $type = 'object';
            } elseif (isset($schema['items'])) {
                $type = 'array';
            } else {
                $type = 'string';
            }
        }

        switch ($type) {
            case 'object':
                $result = [];
                foreach ($schema['properties'] ?? [] as $key => $propSchema) {
                    $result[$key] = $this->buildExample($propSchema, $spec, $depth + 1);
                }

                return $result;
            case 'array':
                if (isset($schema['items'])) {
                    return [$this->buildExample($schema['items'], $spec, $depth + 1)];
                }

                return [];
            case 'integer':
                return 0;
            case 'number':
                return 0;
            case 'boolean':
                return false;
            case 'null':
                return null;
            case 'string':
            default:
                $format = $schema['format'] ?? null;
                if ($format === 'date-time' || $format === 'date' || $format === 'time') {
                    return null;
                }

                return '';
        }
    }

    /**
     * Build a Postman collection auth block from OpenAPI security requirements.
     */
    protected function buildAuth(array $security): ?array
    {
        foreach ($security as $requirement) {
            if (isset($requirement['http'])) {
                return [
                    'type' => 'bearer',
                    'bearer' => [
                        [
                            'key' => 'token',
                            'value' => '{{token}}',
                            'type' => 'string',
                        ],
                    ],
                ];
            }

            if (isset($requirement['bearerAuth'])) {
                return [
                    'type' => 'bearer',
                    'bearer' => [
                        [
                            'key' => 'token',
                            'value' => '{{token}}',
                            'type' => 'string',
                        ],
                    ],
                ];
            }

            if (isset($requirement['apiKey'])) {
                return [
                    'type' => 'apikey',
                    'apikey' => [
                        ['key' => 'key', 'value' => 'X-API-Key', 'type' => 'string'],
                        ['key' => 'value', 'value' => '{{apiKey}}', 'type' => 'string'],
                        ['key' => 'in', 'value' => 'header', 'type' => 'string'],
                    ],
                ];
            }
        }

        return null;
    }

    protected function hasHeader(array $headers, string $name): bool
    {
        foreach ($headers as $header) {
            if (strcasecmp($header['key'], $name) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Split a path template into segments, marking path variables as Postman URL variables.
     */
    protected static function splitPath(string $path): array
    {
        $segments = [];
        foreach (explode('/', trim($path, '/')) as $segment) {
            if ($segment === '') {
                continue;
            }

            if (preg_match('/^\{([^}]+)\}$/', $segment, $m)) {
                $segments[] = [':'.$m[1]];
            } else {
                $segments[] = $segment;
            }
        }

        return $segments;
    }

    protected static function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0F) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3F) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}

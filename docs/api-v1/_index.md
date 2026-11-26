---
title: API v1
description: Versioned Sanctum JSON API for Android/mobile clients.
order: 1
---

# AcaRed API v1

Versioned JSON API for the Android/mobile client. Legacy `/api/*` endpoints remain unchanged.

- **Base URL**: `/api/v1`
- **Format**: JSON (`Accept: application/json`)
- **Auth**: Sanctum personal access token (`Authorization: Bearer <token>`)
- **OpenAPI**: raw spec in repo `docs/openapi-v1.json`

## Quick Start

1. `POST /api/v1/auth/login` with `email`, `password`, optional `device_name`.
2. Store returned `token`; send `Authorization: Bearer <token>`.
3. For team-scoped endpoints, send `X-Team-Slug` or `X-Team-ID`.
4. Use per-endpoint pages for request/response schemas and examples.

## Team Context

All team-scoped endpoints require `X-Team-Slug` or `X-Team-ID`. Context is request-only (does not persist `current_team_id`).

- Missing header: `400` with `success:false`
- Invalid/non-member team: `403`/`404` with `success:false`

## Response Envelope

v1 normalizes JSON responses by adding `success` and `message` when missing, while preserving existing keys (`data`, `token`, `token_type`, `user`, `meta`, `links`, `errors`).

## Permissions

- `permission.api:<name>` accepts pipe-separated alternatives (`a|b`).
- Roleless-user pass-through is **disabled by default** (`config/api_v1.php`, `API_V1_ALLOW_ROLELESS_PERMISSION_PASS=false`). Enable only for explicit legacy migration compatibility.
- Sensitive write actions return `403` with `success:false`.

## Endpoint Pages

See [Endpoint Index](endpoints-index) for one page per endpoint, grouped by model.

---
title: "Consultations: List"
description: "api.v1.consultations.index"
---
# GET `/api/v1/consultations`

**Operation:** `api_v1_consultations_index`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** consultations

## Summary
api.v1.consultations.index

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |
| `page` | query | no | `integer` |  |
| `per_page` | query | no | `integer` |  |
| `q` | query | no | `string` | Search query. |

## Request Body
_No request body._

## Responses
### 200 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `array` | yes |  |
| `links` | `PaginationLinks` | yes |  |
| `meta` | `PaginationMeta` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "patient_id": "PAT-001",
      "patient": {
        "slug": "PAT-001",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "doctor": {
        "id": 5,
        "name": "Dr. Who"
      },
      "status": "scheduled",
      "purpose": "Checkup",
      "starts_at": "2026-12-01T09:00:00Z",
      "ends_at": "2026-12-01T09:30:00Z",
      "appointment_id": 1,
      "billing_id": 10
    }
  ],
  "links": {
    "first": null,
    "last": null,
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "/api/v1/...",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### 400 - Bad request

`Error`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |

```json
{
  "success": false,
  "message": "Team context is required. Provide X-Team-Slug or X-Team-ID header."
}
```

### 401 - Unauthenticated

`Error`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |

```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### 403 - Forbidden

`Error`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |

```json
{
  "success": false,
  "message": "Forbidden."
}
```

### 404 - Not found

`Error`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |

```json
{
  "success": false,
  "message": "Not found."
}
```

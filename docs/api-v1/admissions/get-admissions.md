---
title: "Admissions: List"
description: "api.v1.admissions.index"
---
# GET `/api/v1/admissions`

**Operation:** `api_v1_admissions_index`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** admissions

## Summary
api.v1.admissions.index

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
      "patient": {
        "slug": "PAT-001",
        "first_name": "Jane",
        "last_name": "Doe",
        "full_name": "Jane Doe"
      },
      "doctor": {
        "id": 5,
        "name": "Dr. Who"
      },
      "ward": {
        "id": 1,
        "name": "Ward A"
      },
      "bed": {
        "id": 2,
        "name": "Bed 1"
      },
      "ward_id": 1,
      "bed_id": 2,
      "notes": "Observation",
      "duration": 1,
      "status": "admitted",
      "created_at": "2026-11-26T10:00:00Z"
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

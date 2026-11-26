---
title: "Teams: List"
description: "api.v1.teams.index"
---
# GET `/api/v1/teams`

**Operation:** `api_v1_teams_index`  
**Auth:** Yes  
**Team header:** No  
**Tags:** teams

## Summary
api.v1.teams.index

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
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
      "name": "Clinic A",
      "slug": "clinic-a",
      "is_personal": false,
      "logo": null,
      "phone": null,
      "mobile": null,
      "email": null,
      "address": null,
      "is_current": true
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

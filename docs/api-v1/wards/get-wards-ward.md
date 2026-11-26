---
title: "Wards: Get"
description: "api.v1.wards.show"
---
# GET `/api/v1/wards/{ward}`

**Operation:** `api_v1_wards_show`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** wards

## Summary
api.v1.wards.show

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `ward` | path | yes | `integer` |  |
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
_No request body._

## Responses
### 200 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `Ward` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Ward A",
    "description": "Main ward",
    "capacity": 2,
    "status": "available",
    "is_ward": true,
    "ward_id": null,
    "beds_count": 2,
    "active_admissions_count": 1,
    "beds": [
      {
        "id": 2,
        "name": "Bed 1",
        "status": "occupied",
        "ward_id": 1
      }
    ]
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

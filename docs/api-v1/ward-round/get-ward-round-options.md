---
title: "Ward Round: Options"
description: "api.v1.ward-round.options"
---
# GET `/api/v1/ward-round/options`

**Operation:** `api_v1_ward_round_options`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** ward-round

## Summary
api.v1.ward-round.options

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
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
| `data` | `WardRoundOptions` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "services": [
      {
        "id": 1,
        "name": "Consultation",
        "price": 1000
      }
    ],
    "doctors": [
      {
        "id": 5,
        "name": "Dr. Who"
      }
    ],
    "wards": [
      {
        "id": 1,
        "name": "Ward A"
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

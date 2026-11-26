---
title: "Nursing: Transfer"
description: "api.v1.nursing.transfer"
---
# POST `/api/v1/nursing/{nursing}/transfer`

**Operation:** `api_v1_nursing_transfer`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** nursing

## Summary
api.v1.nursing.transfer

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `nursing` | path | yes | `integer` |  |
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
Required: yes

`NursingTransferRequest`

| Field | Type | Required | Description |
|---|---|---:|---|
| `transferTo` | `string` | yes |  |

### Example
```json
{
  "transferTo": "doctor",
  "doctor_id": 5
}
```

## Responses
### 200 - OK

`Envelope`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `object` | no |  |

```json
{
  "success": true,
  "message": "OK"
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

### 422 - Validation error

`ValidationError`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | no |  |
| `message` | `string` | yes |  |
| `errors` | `object` | yes |  |

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "field": [
      "The field is required."
    ]
  }
}
```

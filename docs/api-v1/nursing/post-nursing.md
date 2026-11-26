---
title: "Nursing: Create"
description: "api.v1.nursing.store"
---
# POST `/api/v1/nursing`

**Operation:** `api_v1_nursing_store`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** nursing

## Summary
api.v1.nursing.store

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
Required: yes

`NursingStoreRequest`

| Field | Type | Required | Description |
|---|---|---:|---|
| `patient_id` | `string` | yes |  |
| `nurse_id` | `integer` | no |  |
| `billing_id` | `integer` | yes |  |
| `purpose` | `string` | no |  |
| `status` | `string` | no |  |

### Example
```json
{
  "patient_id": "PAT-001",
  "billing_id": 10,
  "nurse_id": 7,
  "purpose": "Vitals"
}
```

## Responses
### 201 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `Nursing` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "patient": {
      "slug": "PAT-001",
      "first_name": "Jane",
      "last_name": "Doe"
    },
    "nurse": {
      "id": 7,
      "name": "Nurse Joy"
    },
    "status": "scheduled",
    "starts_at": "2026-12-01T09:00:00Z",
    "ends_at": "2026-12-01T09:30:00Z",
    "vitals": []
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

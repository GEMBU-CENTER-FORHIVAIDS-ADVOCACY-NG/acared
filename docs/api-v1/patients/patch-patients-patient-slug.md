---
title: "Patients: Update (PATCH)"
description: "api.v1.patients.update"
---
# PATCH `/api/v1/patients/{patient:slug}`

**Operation:** `api_v1_patients_update`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** patients

## Summary
Supports `PUT` and `PATCH`.

api.v1.patients.update

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `patient` | path | yes | `string` |  |
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
Required: yes

`PatientUpdateRequest`

object (additionalProperties=False)

### Example
```json
{
  "phone": "08000000000"
}
```

## Responses
### 200 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `Patient` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "slug": "PAT-001",
    "first_name": "Jane",
    "middle_name": null,
    "last_name": "Doe",
    "gender": "female",
    "birth_date": "1990-01-01",
    "email": "jane@example.com",
    "phone": "08000000000",
    "address": "Lagos",
    "category": {
      "id": 1,
      "name": "General"
    },
    "country_id": 1,
    "state_id": 1,
    "lga_id": 1,
    "created_at": "2026-11-26T10:00:00Z"
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

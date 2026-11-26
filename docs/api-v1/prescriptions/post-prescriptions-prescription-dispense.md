---
title: "Prescriptions: Dispense"
description: "api.v1.prescriptions.dispense"
---
# POST `/api/v1/prescriptions/{prescription}/dispense`

**Operation:** `api_v1_prescriptions_dispense`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** prescriptions

## Summary
api.v1.prescriptions.dispense

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `prescription` | path | yes | `integer` |  |
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
Required: yes

`PrescriptionDispenseRequest`

| Field | Type | Required | Description |
|---|---|---:|---|
| `line_ids` | `array` | no |  |
| `line_ids.*` | `integer` | no |  |

### Example
```json
{
  "line_ids": [
    1,
    2
  ]
}
```

## Responses
### 200 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `Prescription` | yes |  |

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
    "doctor": {
      "id": 5,
      "name": "Dr. Who"
    },
    "status": "pending",
    "total": 1000,
    "created_at": "2026-11-26T10:00:00Z",
    "lines": []
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

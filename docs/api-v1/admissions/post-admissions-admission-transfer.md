---
title: "Admissions: Transfer"
description: "api.v1.admissions.transfer"
---
# POST `/api/v1/admissions/{admission}/transfer`

**Operation:** `api_v1_admissions_transfer`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** admissions

## Summary
api.v1.admissions.transfer

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `admission` | path | yes | `integer` |  |
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
Required: yes

`AdmissionTransferRequest`

| Field | Type | Required | Description |
|---|---|---:|---|
| `ward_id` | `integer` | yes |  |
| `bed_id` | `integer` | yes |  |
| `notes` | `string` | no |  |

### Example
```json
{
  "ward_id": 1,
  "bed_id": 3,
  "notes": "Transfer"
}
```

## Responses
### 200 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `Admission` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "data": {
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

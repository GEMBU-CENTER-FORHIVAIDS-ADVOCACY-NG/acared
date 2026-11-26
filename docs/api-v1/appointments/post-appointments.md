---
title: "Appointments: Create"
description: "api.v1.appointments.store"
---
# POST `/api/v1/appointments`

**Operation:** `api_v1_appointments_store`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** appointments

## Summary
api.v1.appointments.store

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |

## Request Body
Required: yes

`AppointmentStoreRequest`

| Field | Type | Required | Description |
|---|---|---:|---|
| `billing_id` | `integer` | yes |  |
| `doctor_id` | `integer` | no |  |
| `nurse_id` | `integer` | no |  |
| `starts_at` | `string (date-time)` | yes |  |
| `purpose` | `string` | no |  |
| `vital_signs` | `array` | no |  |

### Example
```json
{
  "billing_id": 10,
  "doctor_id": 5,
  "starts_at": "2026-12-01T09:00:00Z",
  "purpose": "Consultation"
}
```

## Responses
### 201 - OK

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `data` | `Appointment` | yes |  |

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
    "nurse": null,
    "status": "scheduled",
    "purpose": "Checkup",
    "starts_at": "2026-12-01T09:00:00Z",
    "ends_at": "2026-12-01T09:30:00Z",
    "billing_id": 10
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

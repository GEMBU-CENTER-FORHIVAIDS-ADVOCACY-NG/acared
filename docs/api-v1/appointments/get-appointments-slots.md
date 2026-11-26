---
title: "Appointments: Slots"
description: "api.v1.appointments.slots"
---
# GET `/api/v1/appointments/slots`

**Operation:** `api_v1_appointments_slots`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** appointments

## Summary
api.v1.appointments.slots

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |
| `date` | query | yes | `string` |  |
| `doctor_id` | query | no | `integer` |  |

## Request Body
_No request body._

## Responses
### 200 - OK

`AppointmentSlots`

| Field | Type | Required | Description |
|---|---|---:|---|
| `data` | `array` | no |  |

```json
{
  "data": [
    {
      "start": "2026-12-01T09:00:00Z",
      "label": "09:00 AM",
      "status": "available"
    }
  ]
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

---
title: "Consultations: List records"
description: "api.v1.consultations.records.index"
---
# GET `/api/v1/consultations/{consultation}/records`

**Operation:** `api_v1_consultations_records_index`  
**Auth:** Yes  
**Team header:** Yes  
**Tags:** consultations

## Summary
api.v1.consultations.records.index

## Parameters
| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `consultation` | path | yes | `integer` |  |
| `X-Team-Slug` | header | no | `string` | Team slug. Provide this or X-Team-ID for team-scoped endpoints. |
| `X-Team-ID` | header | no | `integer` | Team ID. Provide this or X-Team-Slug for team-scoped endpoints. |
| `type` | query | no | `string` |  |
| `page` | query | no | `integer` |  |
| `per_page` | query | no | `integer` |  |

## Request Body
_No request body._

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

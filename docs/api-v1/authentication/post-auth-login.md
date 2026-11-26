---
title: "Authentication: Create"
description: "api.v1.auth.login"
---
# POST `/api/v1/auth/login`

**Operation:** `api_v1_auth_login`  
**Auth:** No  
**Team header:** No  
**Tags:** auth

## Summary
api.v1.auth.login

## Parameters
_No parameters._

## Request Body
Required: yes

`LoginRequest`

| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `string (email)` | yes |  |
| `password` | `string (password)` | yes |  |
| `device_name` | `string` | no |  |

### Example
```json
{
  "email": "user@example.com",
  "password": "secret",
  "device_name": "android"
}
```

## Responses
### 200 - Authenticated

`LoginResponse`

| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `boolean` | yes |  |
| `message` | `string` | yes |  |
| `token` | `string` | yes |  |
| `token_type` | `string` | yes |  |
| `user` | `AuthUser` | yes |  |

```json
{
  "success": true,
  "message": "OK",
  "token": "1|plain-text-token",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "User",
    "email": "user@example.com"
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

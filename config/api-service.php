<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Login Rules
    |--------------------------------------------------------------------------
    |
    | The rules used to validate the credentials sent to the login endpoint.
    |
    */

    'login-rules' => [
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Login Middleware
    |--------------------------------------------------------------------------
    |
    | The middleware applied to the login endpoint.
    |
    */

    'login-middleware' => [
        'throttle:api',
    ],

    /*
    |--------------------------------------------------------------------------
    | Logout Middleware
    |--------------------------------------------------------------------------
    |
    | The middleware applied to the logout endpoint.
    |
    */

    'logout-middleware' => [
        'auth:api',
    ],

];

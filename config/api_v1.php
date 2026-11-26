<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Roleless permission pass-through
    |--------------------------------------------------------------------------
    | Legacy/mobile compatibility: users with no assigned roles pass permission
    | middleware. Defaults to false (enforced). Set true only for explicit legacy
    | compatibility during migration.
    */
    'allow_roleless_permission_pass' => (bool) env('API_V1_ALLOW_ROLELESS_PERMISSION_PASS', false),
];

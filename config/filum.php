<?php

use App\Models\User;

return [

    'users' => [

        /*
         * The Eloquent model backing filum participants/messages, so key types
         * (integer, UUID or ULID) resolve correctly.
         */
        'model' => User::class,

    ],

];

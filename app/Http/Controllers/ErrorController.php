<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ErrorController extends Controller
{
    /**
     * Display the forbidden (403) error page.
     */
    public function forbidden(): Response
    {
        return Inertia::render('errors/403');
    }
}

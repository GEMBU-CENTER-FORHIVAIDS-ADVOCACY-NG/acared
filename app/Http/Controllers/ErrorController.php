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

    /**
     * Display the not found (404) error page.
     */
    public function notFound(): Response
    {
        return Inertia::render('errors/404');
    }

    /**
     * Display the page expired (419) error page.
     */
    public function pageExpired(): Response
    {
        return Inertia::render('errors/419');
    }

    /**
     * Display the too many requests (429) error page.
     */
    public function tooManyRequests(): Response
    {
        return Inertia::render('errors/429');
    }

    /**
     * Display the server error (500) error page.
     */
    public function serverError(): Response
    {
        return Inertia::render('errors/500');
    }

    /**
     * Display the service unavailable (503) error page.
     */
    public function serviceUnavailable(): Response
    {
        return Inertia::render('errors/503');
    }
}

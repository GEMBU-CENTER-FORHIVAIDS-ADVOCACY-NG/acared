<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ConnectionBadgePingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()
            ->json([
                'ok' => true,
                'ts' => now()->getPreciseTimestamp(3),
            ])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0')
            ->header('X-Robots-Tag', 'noindex, nofollow');
    }
}

<?php

use App\Models\User;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$user = User::find(4);
$request = Request::create('/settings/teams', 'GET');
$app->instance('request', $request);

session()->start();
auth()->login($user);

$response = $kernel->handle($request);
$html = $response->getContent();
preg_match('/data-page="([^"]+)"/', $html, $matches);
if (isset($matches[1])) {
    $raw = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $page = json_decode($raw, true);
    if ($page === null) {
        echo 'JSON decode error: '.json_last_error_msg()."\n";
        echo 'Raw first 200 chars: '.substr($raw, 0, 200)."\n";
    } else {
        echo 'Component: '.$page['component']."\n";
        echo 'Props keys: '.implode(', ', array_keys($page['props']))."\n";
        echo 'teams keys: '.implode(', ', array_keys($page['props']['teams']))."\n";
    }
}

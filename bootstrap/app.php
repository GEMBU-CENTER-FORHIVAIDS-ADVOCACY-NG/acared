<?php

use App\Http\Controllers\ErrorController;
use App\Http\Middleware\EnsureApiPermission;
use App\Http\Middleware\EnsureApiV1Json;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetApiTeamContext;
use App\Http\Middleware\SetTeamUrlDefaults;
use App\Http\Middleware\UpdateUserActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'permission' => EnsurePermission::class,
            'permission.api' => EnsureApiPermission::class,
            'team.api' => SetApiTeamContext::class,
            'api.v1.json' => EnsureApiV1Json::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetTeamUrlDefaults::class,
            UpdateUserActivity::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if ($request->is('api/v1/*')) {
                if ($response instanceof JsonResponse) {
                    $data = $response->getData(true);
                    if (is_array($data)) {
                        $status = $response->getStatusCode();
                        $success = $status >= 200 && $status < 400;
                        $data['success'] = $data['success'] ?? $success;
                        $data['message'] = $data['message'] ?? ($status === 422 ? 'The given data was invalid.' : ($status === 401 ? 'Unauthenticated.' : ($status === 403 ? 'Forbidden.' : ($status === 404 ? 'Not found.' : ($success ? 'OK' : 'Request failed.')))));
                        $response->setData($data);
                    }
                }

                return $response;
            }

            if (! $exception instanceof HttpException || $request->is('api/*') || $request->expectsJson()) {
                return $response;
            }

            $statusCode = $exception->getStatusCode();

            $mapping = [
                403 => [ErrorController::class, 'forbidden'],
                404 => [ErrorController::class, 'notFound'],
                419 => [ErrorController::class, 'pageExpired'],
                429 => [ErrorController::class, 'tooManyRequests'],
                500 => [ErrorController::class, 'serverError'],
                503 => [ErrorController::class, 'serviceUnavailable'],
            ];

            if (isset($mapping[$statusCode])) {
                $controllerAction = $mapping[$statusCode];
                $response = app($controllerAction[0])->{$controllerAction[1]}()->toResponse($request);
                $response->setStatusCode($statusCode);

                return $response;
            }

            return $response;
        });
    })->create();

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiV1Json
{
    /**
     * Force JSON and normalize v1 envelope fields without breaking existing keys.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        $response = $next($request);

        if (! $response instanceof JsonResponse) {
            return $response;
        }

        $data = $response->getData(true);
        if (! is_array($data)) {
            return $response;
        }

        $status = $response->getStatusCode();
        $success = $status >= 200 && $status < 400;

        if (! array_key_exists('success', $data)) {
            $data['success'] = $success;
        }

        if (! array_key_exists('message', $data)) {
            $data['message'] = $this->defaultMessage($status, $success, $data);
        }

        $response->setData($data);

        return $response;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function defaultMessage(int $status, bool $success, array $data): string
    {
        if (isset($data['errors']) && is_array($data['errors'])) {
            return $status === 422 ? 'The given data was invalid.' : 'Request failed.';
        }

        return match (true) {
            $success => 'OK',
            $status === 401 => 'Unauthenticated.',
            $status === 403 => 'Forbidden.',
            $status === 404 => 'Not found.',
            default => 'Request failed.',
        };
    }
}

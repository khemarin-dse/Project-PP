<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ── CORS ─────────────────────────────────────────────────
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // ── Sanctum stateful ─────────────────────────────────────
        $middleware->statefulApi();

        // ── Role middleware alias ─────────────────────────────────
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // ── Return JSON for unauthenticated API requests ──────────
        // This fixes the "Route [login] not defined" error
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated. Please log in.',
                ], 401);
            }
        });

    })->create();

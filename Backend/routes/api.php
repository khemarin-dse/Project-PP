<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ── Public routes ────────────────────────────────────────────────────────────
Route::post('/register',    [AuthController::class, 'register']);
Route::post('/login',       [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

// Contact — allow both guests and logged-in users
Route::post('/contact', [ContactController::class, 'store']);

// ── Authenticated routes ─────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Quiz
    Route::post('/quiz/submit', [QuizController::class, 'submit']);
    Route::get('/quiz/history', [QuizController::class, 'history']);

    // Notifications — for logged-in users
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all',   [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // ── Admin routes ─────────────────────────────────────────────────────────
    Route::middleware('role:admin,superadmin')->group(function () {

        // User management
        Route::get('/users',                 [UserController::class, 'index']);
        Route::post('/users',                [UserController::class, 'store']);
        Route::patch('/users/{user}',        [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle', [UserController::class, 'toggleStatus']);
        Route::delete('/users/{user}',       [UserController::class, 'destroy']);

        // Contact messages
        Route::get('/contact',                         [ContactController::class, 'index']);
        Route::patch('/contact/{contactMessage}/read', [ContactController::class, 'markRead']);
        Route::post('/contact/{contactMessage}/reply', [ContactController::class, 'reply']);
    });

    // ── Super Admin routes ────────────────────────────────────────────────────
    Route::middleware('role:superadmin')->group(function () {
        Route::get('/admins',           [AdminController::class, 'index']);
        Route::post('/admins',          [AdminController::class, 'store']);
        Route::patch('/admins/{user}',  [AdminController::class, 'update']);
        Route::delete('/admins/{user}', [AdminController::class, 'destroy']);
        Route::get('/activity-logs',    [ActivityLogController::class, 'index']);
    });
});

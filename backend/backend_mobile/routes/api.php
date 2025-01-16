<?php

use App\Http\Controllers\ResellerController;
use App\Http\Controllers\UserSalesController;
use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::post('register', [UserSalesController::class, 'register']);
Route::post('login', [UserSalesController::class, 'login']);
Route::post('/auth/verify-phone', [UserSalesController::class, 'verifyPhone']);

// Route untuk CRUD Reseller
Route::middleware('auth:sanctum')->group(function () {
    // Reseller Routes
    Route::post('/resellers', [ResellerController::class, 'store']);       // Create reseller
    Route::get('/resellers', [ResellerController::class, 'index']);        // List semua reseller
    Route::get('/resellers/{id}', [ResellerController::class, 'show']);    // Detail reseller berdasarkan ID
    Route::put('/resellers/{id}', [ResellerController::class, 'update']); 
    Route::patch('/resellers/{id}/status', [ResellerController::class, 'updateStatus']); // Update reseller berdasarkan ID
    Route::delete('/resellers/{id}', [ResellerController::class, 'destroy']); // Hapus reseller

    Route::post('/tasks', [TaskController::class, 'store']); // Create task
    Route::get('/tasks', [TaskController::class, 'index']); // List tasks
    Route::put('/tasks/{id}', [TaskController::class, 'update']); // Update task
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']); // Delete task
    Route::put('/tasks/{id}/mark-as-completed', [TaskController::class, 'markAsCompleted']); // Mark task as completed
});
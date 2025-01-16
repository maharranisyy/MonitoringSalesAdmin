<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserSalesController;
use App\Http\Controllers\ResellerController;
use App\Http\Controllers\TaskController;

Route::post('register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [App\Http\Controllers\AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routes for UserSales
    Route::get('/users-sales', [UserSalesController::class, 'index']);
    Route::post('/users-sales', [UserSalesController::class, 'create']);
    Route::get('/users-sales/{id}', [UserSalesController::class, 'show']);
    Route::put('/users-sales/{id}', [UserSalesController::class, 'update']);
    Route::delete('/users-sales/{id}', [UserSalesController::class, 'destroy']);

    // Routes for Resellers
    Route::post('/resellers', [ResellerController::class, 'store']); // Create a new reseller
    Route::get('/resellers', [ResellerController::class, 'index']); // List all resellers
    Route::get('/resellers/{id}', [ResellerController::class, 'show']); // Show a single reseller's details
    Route::put('/resellers/{id}', [ResellerController::class, 'update']); // Update reseller data
    Route::delete('/resellers/{id}', [ResellerController::class, 'destroy']); // Delete reseller

    // Custom Route to update the reseller's status
    Route::patch('/resellers/{id}/status', [ResellerController::class, 'updateStatus']); // Update status of reseller

    // Filter by status (verified/unverified)
    Route::get('/resellers/status/{status}', [ResellerController::class, 'filterByStatus']);
    
    // Routes for TaskPekerjaan (Jobs)
    Route::post('/tasks', [TaskController::class, 'store']); // Create task
    Route::get('/tasks', [TaskController::class, 'index']); // List tasks
    Route::put('/tasks/{id}', [TaskController::class, 'update']); // Update task
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']); // Delete task
    Route::put('/tasks/{id}/mark-as-completed', [TaskController::class, 'markAsCompleted']); // Mark task as completed
});

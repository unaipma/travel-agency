<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;

use App\Http\Controllers\Api\Admin\TripController as AdminTripController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\DashboardController;


Route::get('/trips', [TripController::class, 'index']);
Route::get('/trips/{id}', [TripController::class, 'show']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//AuthController
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
   // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Favoritos
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{trip}', [FavoriteController::class, 'toggle']);

    // Reservas
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);

    //pagos
    Route::post('/checkout/{bookingId}', [PaymentController::class, 'createCheckoutSession']);
    Route::post('/payment/verify', [PaymentController::class, 'verifySession']);
});



// RUTAS DEL ADMINISTRADOR

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    

    Route::apiResource('trips', AdminTripController::class);
    

    Route::apiResource('users', AdminUserController::class);
    
    Route::apiResource('bookings', AdminBookingController::class)->only(['index', 'show', 'update']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::patch('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);
});
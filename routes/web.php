<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController; // <-- ¡Esta es la pieza que faltaba!

Route::inertia('/', 'welcome')->name('home');
Route::get('/usuarios', [UserController::class, 'index'])->name('users.index');
Route::get('/usuarios/crear', [UserController::class, 'create'])
    ->name('users.create');
    Route::post('/usuarios', [UserController::class, 'store'])
    ->name('users.store');
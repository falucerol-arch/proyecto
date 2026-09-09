<?php
use App\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController; // <-- ¡Esta es la pieza que faltaba!

Route::inertia('/', 'welcome')->name('home');
Route::get('/usuarios', [UserController::class, 'index'])->name('users.index');

Route::get('/usuarios/crear', [UserController::class, 'create'])
    ->name('users.create');

    Route::post('/usuarios', [UserController::class, 'store'])
    ->name('users.store');

    Route::get('/usuarios/{user}/editar', [UserController::class, 'edit'])
    ->name('users.edit');

    Route::patch('/usuarios/{user}', [UserController::class, 'update'])
    ->name('users.update');

    Route::delete('/usuarios/{user}', [UserController::class, 'destroy'])
    ->name('users.destroy');

    Route::get('/empresas', [CompanyController::class, 'index'])
    ->name('companies.index');
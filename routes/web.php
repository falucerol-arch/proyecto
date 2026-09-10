<?php
use App\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController; // <-- ¡Esta es la pieza que faltaba!
use App\Http\Controllers\DepartmentController;

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

    Route::post('/empresas', [CompanyController::class, 'store'])
    ->name('companies.store');

    Route::patch('/empresas/{company}', [CompanyController::class, 'update'])
    ->name('companies.update');

    Route::delete('/empresas/{company}', [CompanyController::class, 'destroy'])
    ->name('companies.destroy');

    Route::get('/departamentos', [DepartmentController::class, 'index'])
    ->name('departments.index');

Route::post('/departamentos', [DepartmentController::class, 'store'])
    ->name('departments.store');

Route::patch('/departamentos/{department}', [DepartmentController::class, 'update'])
    ->name('departments.update');

Route::delete('/departamentos/{department}', [DepartmentController::class, 'destroy'])
    ->name('departments.destroy');
    
    Route::get('/usuarios/{user}/foto', [UserController::class, 'photo'])
    ->name('users.photo');
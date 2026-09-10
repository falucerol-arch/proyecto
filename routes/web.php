<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


// Cuando se entra a la dirección principal
Route::get('/', function () {

    // Si ya inició sesión entra a Personal
    if (auth()->check()) {
        return redirect()->route('users.index');
    }

    // Si no ha iniciado sesión lo manda al login
    return redirect()->route('login');
});


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

// Estas rutas solamente se utilizan cuando NO hay sesión iniciada
Route::middleware('guest')->group(function () {

    // Muestra la pantalla del login
    Route::get(
        '/login',
        [LoginController::class, 'show']
    )->name('login');


    // Recibe el correo y contraseña
    Route::post(
        '/login',
        [LoginController::class, 'login']
    )->name('login.attempt');
});


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS
|--------------------------------------------------------------------------
|
| Para entrar a cualquiera de estas páginas primero se debe iniciar sesión.
|
*/

Route::middleware('auth')->group(function () {


    // Este botón cierra la sesión
    Route::post(
        '/logout',
        [LoginController::class, 'logout']
    )->name('logout');


    /*
    |--------------------------------------------------------------------------
    | USUARIOS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/usuarios',
        [UserController::class, 'index']
    )->name('users.index');


    Route::get(
        '/usuarios/crear',
        [UserController::class, 'create']
    )->name('users.create');


    Route::post(
        '/usuarios',
        [UserController::class, 'store']
    )->name('users.store');


    Route::patch(
        '/usuarios/{user}',
        [UserController::class, 'update']
    )->name('users.update');


    Route::delete(
        '/usuarios/{user}',
        [UserController::class, 'destroy']
    )->name('users.destroy');


    Route::get(
        '/usuarios/{user}/foto',
        [UserController::class, 'photo']
    )->name('users.photo');


    /*
    |--------------------------------------------------------------------------
    | EMPRESAS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/empresas',
        [CompanyController::class, 'index']
    )->name('companies.index');


    Route::post(
        '/empresas',
        [CompanyController::class, 'store']
    )->name('companies.store');


    Route::patch(
        '/empresas/{company}',
        [CompanyController::class, 'update']
    )->name('companies.update');


    Route::delete(
        '/empresas/{company}',
        [CompanyController::class, 'destroy']
    )->name('companies.destroy');


    /*
    |--------------------------------------------------------------------------
    | DEPARTAMENTOS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/departamentos',
        [DepartmentController::class, 'index']
    )->name('departments.index');


    Route::post(
        '/departamentos',
        [DepartmentController::class, 'store']
    )->name('departments.store');


    Route::patch(
        '/departamentos/{department}',
        [DepartmentController::class, 'update']
    )->name('departments.update');


    Route::delete(
        '/departamentos/{department}',
        [DepartmentController::class, 'destroy']
    )->name('departments.destroy');
});
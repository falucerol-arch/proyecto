<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        // Traemos todos los usuarios y sus relaciones
        $users = User::with(['company', 'department'])->get();

        // Renderizamos el componente React y le pasamos los datos
        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }
    public function create(): Response
{
    $companies = Company::all();
    $departments = Department::all();

    return Inertia::render('Users/Create', [
        'companies' => $companies,
        'departments' => $departments,
    ]);
}
}
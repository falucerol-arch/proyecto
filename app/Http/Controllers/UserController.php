<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(): Response
    {
        // Traemos todos los usuarios y sus relaciones
        $users = User::with(['company', 'department'])->get();

        // Renderizamos el componente de React y le pasamos los datos
        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }
}
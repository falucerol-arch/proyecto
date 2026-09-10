<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    // Lista de usuarios, empresas y departamentos
    public function index(): Response
    {
        $users = User::with(['company', 'department'])->get();

        $companies = Company::all();
        $departments = Department::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'companies' => $companies,
            'departments' => $departments,
        ]);
    }


    // Vista antigua para crear usuario
    public function create(): Response
    {
        $companies = Company::all();
        $departments = Department::all();

        return Inertia::render('Users/Create', [
            'companies' => $companies,
            'departments' => $departments,
        ]);
    }


    // Registrar usuario
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'company_id' => [
                'required',
                'exists:companies,id',
            ],

            'department_id' => [
                'required',
                'exists:departments,id',
            ],

            // La fotografía es opcional
            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);


        // Separamos la foto de los demás datos
        $photo = $validated['photo'] ?? null;

        unset($validated['photo']);


        // La contraseña siempre se guarda cifrada
        $validated['password'] = Hash::make(
            $validated['password']
        );


        // Si seleccionó una foto, se almacena en MinIO
        if ($photo) {
            $validated['photo_path'] = $photo->store(
                'usuarios',
                's3'
            );
        }


        User::create($validated);

        return redirect()->route('users.index');
    }


    // Vista antigua de edición
    public function edit(User $user): Response
    {
        $companies = Company::all();
        $departments = Department::all();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'companies' => $companies,
            'departments' => $departments,
        ]);
    }


    // Actualizar usuario
    public function update(
        Request $request,
        User $user
    ): RedirectResponse {

        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'company_id' => [
                'required',
                'exists:companies,id',
            ],

            'department_id' => [
                'required',
                'exists:departments,id',
            ],

            // Ya dejamos preparado el backend
            // para cambiar la foto más adelante
            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);


        $photo = $validated['photo'] ?? null;

        unset($validated['photo']);


        // Si se envió una foto nueva
        if ($photo) {

            // Elimina la foto anterior de MinIO
            if ($user->photo_path) {
                Storage::disk('s3')->delete(
                    $user->photo_path
                );
            }


            // Guarda la nueva fotografía
            $validated['photo_path'] = $photo->store(
                'usuarios',
                's3'
            );
        }


        $user->update($validated);

        return redirect()->route('users.index');
    }

    // Devuelve la fotografía guardada en MinIO
public function photo(User $user)
{
    if (!$user->photo_path) {
        abort(404);
    }

    $disk = Storage::disk('s3');

    if (!$disk->exists($user->photo_path)) {
        abort(404);
    }

    return response(
        $disk->get($user->photo_path),
        200,
        [
            'Content-Type' => $disk->mimeType($user->photo_path),
        ]
    );
}


    // Eliminar usuario
    public function destroy(User $user): RedirectResponse
    {
        // Si tiene fotografía, también se elimina de MinIO
        if ($user->photo_path) {
            Storage::disk('s3')->delete(
                $user->photo_path
            );
        }


        $user->delete();

        return redirect()->route('users.index');
    }
}
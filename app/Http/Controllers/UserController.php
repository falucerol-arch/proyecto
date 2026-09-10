<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    // Muestra todos los usuarios junto con empresa y departamento
    public function index(): Response
    {
        return Inertia::render('Users/Index', [

            // Obtiene los usuarios con sus relaciones
            'users' => User::with([
                'company',
                'department',
            ])->get(),

            // Se utilizan para llenar el selector de empresas
            'companies' => Company::all(),

            // Se utilizan para llenar el selector de departamentos
            'departments' => Department::all(),
        ]);
    }


    // Muestra la página antigua de crear usuario si todavía se utiliza
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'companies' => Company::all(),
            'departments' => Department::all(),
        ]);
    }


    // Registra un usuario nuevo
    public function store(Request $request): RedirectResponse
    {
        // Valida todos los datos recibidos desde React
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
                'max:255',
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

            // El puesto pertenece directamente al usuario
            'position' => [
                'nullable',
                'string',
                'max:100',
            ],

            // La fotografía es opcional
            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);


        // Guarda temporalmente la fotografía
        $photo = $request->file('photo');

        // No queremos guardar el archivo directamente en SQLite
        unset($validated['photo']);


        // La contraseña se guarda cifrada
        $validated['password'] = Hash::make(
            $validated['password']
        );


        // Si hay una fotografía la guarda en MinIO
        if ($photo) {

            $validated['photo_path'] =
                $photo->store(
                    'usuarios',
                    's3'
                );
        }


        // Guarda el usuario en SQLite
        User::create($validated);


        return redirect()
            ->route('users.index');
    }


    // Actualiza los datos de un usuario
    public function update(
        Request $request,
        User $user
    ): RedirectResponse {

        // Valida los cambios realizados
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
                'max:255',

                // Permite conservar el correo del usuario actual
                Rule::unique(
                    'users',
                    'email'
                )->ignore($user->id),
            ],

            'company_id' => [
                'required',
                'exists:companies,id',
            ],

            'department_id' => [
                'required',
                'exists:departments,id',
            ],

            // Permite cambiar el puesto del usuario
            'position' => [
                'nullable',
                'string',
                'max:100',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);


        // Obtiene la fotografía nueva si existe
        $photo = $request->file('photo');

        unset($validated['photo']);


        // Si se seleccionó una foto nueva
        if ($photo) {

            // Primero guarda la nueva fotografía
            $newPhotoPath =
                $photo->store(
                    'usuarios',
                    's3'
                );


            // Luego elimina la fotografía anterior de MinIO
            if ($user->photo_path) {

                Storage::disk('s3')
                    ->delete(
                        $user->photo_path
                    );
            }


            // Guarda la dirección de la fotografía nueva
            $validated['photo_path'] =
                $newPhotoPath;
        }


        // Actualiza el usuario en SQLite
        $user->update($validated);


        return redirect()
            ->route('users.index');
    }


    // Entrega la fotografía guardada en MinIO al navegador
    public function photo(User $user)
    {
        // Si el usuario no tiene fotografía devuelve 404
        if (!$user->photo_path) {
            abort(404);
        }


        // Verifica que la fotografía exista en MinIO
        if (
            !Storage::disk('s3')
                ->exists($user->photo_path)
        ) {
            abort(404);
        }


        // Obtiene la fotografía
        $contents =
            Storage::disk('s3')
                ->get($user->photo_path);


        // Obtiene el tipo de archivo
        $mimeType =
            Storage::disk('s3')
                ->mimeType($user->photo_path)
            ?? 'image/jpeg';


        // Envía la fotografía al navegador
        return response(
            $contents,
            200
        )->header(
            'Content-Type',
            $mimeType
        );
    }


    // Elimina un usuario
    public function destroy(
        User $user
    ): RedirectResponse {

        // Si tiene fotografía también la elimina de MinIO
        if ($user->photo_path) {

            Storage::disk('s3')
                ->delete(
                    $user->photo_path
                );
        }


        // Elimina el usuario de SQLite
        $user->delete();


        return redirect()
            ->route('users.index');
    }
}
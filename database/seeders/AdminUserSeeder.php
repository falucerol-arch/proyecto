<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Busca o crea una empresa para el usuario de acceso
        $company = Company::firstOrCreate(
            ['name' => 'Empresa Demo'],
            ['country' => 'Guatemala']
        );

        // Busca o crea un departamento
        $department = Department::firstOrCreate(
            ['name' => 'Informática']
        );

        // Crea el usuario para iniciar sesión.
        // Si ya existe, actualiza su contraseña.
        User::updateOrCreate(
            ['email' => 'admin@proyecto.com'],
            [
                'first_name' => 'Administrador',
                'last_name' => 'Sistema',
                'password' => Hash::make('Admin12345'),
                'company_id' => $company->id,
                'department_id' => $department->id,
                'position' => 'Administrador',
                'photo_path' => null,
            ]
        );
    }
}
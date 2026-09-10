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
        // Crea una empresa básica si todavía no existe
        $company = Company::firstOrCreate(
            ['name' => 'Empresa Demo'],
            ['country' => 'Guatemala']
        );

        // Crea un departamento básico si todavía no existe
        $department = Department::firstOrCreate(
            ['name' => 'Informática']
        );

        // Crea el usuario de acceso o actualiza su contraseña si ya existe
        User::updateOrCreate(
            ['email' => 'admin@proyecto.com'],
            [
                'first_name' => 'Administrador',
                'last_name' => 'Sistema',
                'password' => Hash::make('Admin12345'),
                'company_id' => $company->id,
                'department_id' => $department->id,
                'photo_path' => null,
            ]
        );
    }
}
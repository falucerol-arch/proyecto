<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Ejecuta el seeder que crea el usuario para iniciar sesión
        $this->call([
            AdminUserSeeder::class,
        ]);
    }
}
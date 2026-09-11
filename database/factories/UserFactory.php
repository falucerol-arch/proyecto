<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),

            'last_name' => fake()->lastName(),

            'email' => fake()
                ->unique()
                ->safeEmail(),

            // Contraseña utilizada por usuarios creados mediante Factory
            'password' => Hash::make('password'),

            'company_id' => Company::factory(),

            'department_id' => Department::factory(),

            // Genera un puesto automáticamente
            'position' => fake()->jobTitle(),

            'photo_path' => null,
        ];
    }
}
<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::factory(3)->create();

        $departments = Department::factory(4)->create();

        User::factory(10)->create([
            'company_id' => fn () => $companies->random()->id,
            'department_id' => fn () => $departments->random()->id,
        ]);
    }
}
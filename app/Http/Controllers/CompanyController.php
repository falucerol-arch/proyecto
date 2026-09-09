<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(): Response
    {
        $companies = Company::withCount('users')->get();

        return Inertia::render('Companies/Index', [
            'companies' => $companies,
        ]);
    }
}
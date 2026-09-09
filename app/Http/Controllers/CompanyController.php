<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
        ]);

        Company::create($validated);

        return redirect()->route('companies.index');
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
        ]);

        $company->update($validated);

        return redirect()->route('companies.index');
    }
        public function destroy(Company $company): RedirectResponse
{
    // No permitir eliminar si tiene usuarios asociados
    if ($company->users()->exists()) {
        return redirect()
            ->route('companies.index')
            ->withErrors([
                'company' => 'No se puede eliminar la empresa porque tiene usuarios asociados.',
            ]);
    }

    $company->delete();

    return redirect()->route('companies.index');
}

}
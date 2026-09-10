<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $departments = Department::withCount('users')->get();

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        Department::create($validated);

        return redirect()->route('departments.index');
    }

    public function update(
        Request $request,
        Department $department
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $department->update($validated);

        return redirect()->route('departments.index');
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->users()->exists()) {
            return redirect()
                ->route('departments.index')
                ->withErrors([
                    'department' =>
                        'No se puede eliminar el departamento porque tiene usuarios asociados.',
                ]);
        }

        $department->delete();

        return redirect()->route('departments.index');
    }
}
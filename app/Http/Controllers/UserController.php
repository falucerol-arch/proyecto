<?php

namespace App\Http\Controllers;
use Illuminate\Validation\Rule;
use App\Models\User;
use App\Models\Company;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
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

    public function create(): Response
    {
        $companies = Company::all();
        $departments = Department::all();

        return Inertia::render('Users/Create', [
            'companies' => $companies,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'company_id' => ['required', 'exists:companies,id'],
            'department_id' => ['required', 'exists:departments,id'],
        ]);
        

        // Nunca guardamos la contraseña directamente
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('users.index');
    }
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

public function update(Request $request, User $user): RedirectResponse
{
    $validated = $request->validate([
        'first_name' => ['required', 'string', 'max:255'],
        'last_name' => ['required', 'string', 'max:255'],

        'email' => [
            'required',
            'email',
            Rule::unique('users', 'email')->ignore($user->id),
        ],

        'company_id' => ['required', 'exists:companies,id'],
        'department_id' => ['required', 'exists:departments,id'],
    ]);

    $user->update($validated);

    return redirect()->route('users.index');
}
public function destroy(User $user): RedirectResponse
{
    $user->delete();

    return redirect()->route('users.index');
}
}
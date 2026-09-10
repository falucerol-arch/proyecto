<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    // Esta función muestra la pantalla de inicio de sesión
    public function show(): Response
    {
        return Inertia::render('Auth/Login');
    }


    // Esta función revisa el correo y la contraseña
    public function login(Request $request): RedirectResponse
    {
        // Comprueba que se haya escrito un correo y una contraseña
        $credentials = $request->validate([
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);


        // Busca el correo en la tabla users y comprueba la contraseña
        if (Auth::attempt($credentials, $request->boolean('remember'))) {

            // Crea una nueva sesión segura
            $request->session()->regenerate();


            // Después de iniciar sesión entra a Personal
            return redirect()->intended(
                route('users.index')
            );
        }


        // Si el correo o contraseña son incorrectos muestra este mensaje
        return back()
            ->withErrors([
                'email' => 'El correo o la contraseña son incorrectos.',
            ])
            ->onlyInput('email');
    }


    // Esta función cierra la sesión
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();


        // Elimina la sesión anterior
        $request->session()->invalidate();


        // Genera un token nuevo de seguridad
        $request->session()->regenerateToken();


        // Regresa al login
        return redirect()->route('login');
    }
}
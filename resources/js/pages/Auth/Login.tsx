import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';


export default function Login() {

    // Guarda los datos que el usuario escribe
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });


    // Esta función envía el correo y contraseña a Laravel
    const submit = (e: FormEvent) => {

        e.preventDefault();


        form.post('/login', {

            // Después del intento limpia la contraseña del formulario
            onFinish: () => {
                form.reset('password');
            },
        });
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

            <Head title="Iniciar sesión" />


            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                {/* Título de la pantalla */}
                <div className="mb-8 text-center">

                    <h1 className="text-2xl font-bold text-gray-900">
                        Iniciar sesión
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Ingresa tu correo y contraseña para acceder al sistema.
                    </p>

                </div>


                <form
                    onSubmit={submit}
                    className="space-y-5"
                >

                    {/* Este campo permite escribir el correo */}
                    <div>

                        <label className="text-sm font-medium text-gray-700">
                            Correo electrónico
                        </label>

                        <input
                            type="email"

                            value={form.data.email}

                            onChange={(e) =>
                                form.setData(
                                    'email',
                                    e.target.value
                                )
                            }

                            autoComplete="email"
                            autoFocus

                            placeholder="correo@empresa.com"

                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-500"
                        />


                        {form.errors.email && (

                            <p className="mt-1 text-sm text-red-500">
                                {form.errors.email}
                            </p>

                        )}

                    </div>


                    {/* Este campo permite escribir la contraseña */}
                    <div>

                        <label className="text-sm font-medium text-gray-700">
                            Contraseña
                        </label>

                        <input
                            type="password"

                            value={form.data.password}

                            onChange={(e) =>
                                form.setData(
                                    'password',
                                    e.target.value
                                )
                            }

                            autoComplete="current-password"

                            placeholder="Contraseña"

                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-500"
                        />


                        {form.errors.password && (

                            <p className="mt-1 text-sm text-red-500">
                                {form.errors.password}
                            </p>

                        )}

                    </div>


                    {/* Esta opción mantiene la sesión iniciada */}
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">

                        <input
                            type="checkbox"

                            checked={form.data.remember}

                            onChange={(e) =>
                                form.setData(
                                    'remember',
                                    e.target.checked
                                )
                            }

                            className="h-4 w-4"
                        />

                        Recordarme

                    </label>


                    {/* Este botón intenta iniciar sesión */}
                    <button
                        type="submit"

                        disabled={form.processing}

                        className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                    >

                        {form.processing
                            ? 'Ingresando...'
                            : 'Iniciar sesión'}

                    </button>

                </form>

            </div>

        </div>
    );
}
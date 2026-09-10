import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppSidebar() {

    // Controla si el menú está abierto o pequeño
    const [expanded, setExpanded] = useState(true);

    // Obtiene la página actual
    const { url } = usePage();


    // Revisa qué opción del menú está activa
    const isActive = (path: string) => {
        return url.startsWith(path);
    };


    // Esta función cierra la sesión
    const logout = () => {
        router.post('/logout');
    };


    return (
        <aside
            className={`relative flex min-h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
                expanded ? 'w-64' : 'w-20'
            }`}
        >

            {/* Título del menú */}
            <div className="flex h-20 items-center justify-center border-b">

                {expanded ? (
                    <h2 className="text-xl font-bold text-gray-900">
                        Administración
                    </h2>
                ) : (
                    <span className="text-lg font-bold">
                        A
                    </span>
                )}

            </div>


            {/* Este botón abre o reduce el menú */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="absolute -right-3 top-24 flex h-7 w-7 items-center justify-center rounded-full border bg-white text-sm shadow-sm hover:bg-gray-100"
            >
                {expanded ? '‹' : '›'}
            </button>


            {/* Opciones del sistema */}
            <nav className="flex flex-1 flex-col gap-2 p-4">

                {/* Este botón abre Personal */}
                <button
                    type="button"
                    onClick={() => router.visit('/usuarios')}
                    className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                        isActive('/usuarios')
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {expanded ? 'Personal' : 'P'}
                </button>


                {/* Este botón abre Empresas */}
                <button
                    type="button"
                    onClick={() => router.visit('/empresas')}
                    className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                        isActive('/empresas')
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {expanded ? 'Empresas' : 'E'}
                </button>


                {/* Este botón abre Departamentos */}
                <button
                    type="button"
                    onClick={() => router.visit('/departamentos')}
                    className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                        isActive('/departamentos')
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {expanded ? 'Departamentos' : 'D'}
                </button>

            </nav>


            {/* Este botón cierra la sesión */}
            <div className="border-t p-4">

                <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    {expanded ? 'Cerrar sesión' : 'Salir'}
                </button>

            </div>

        </aside>
    );
}
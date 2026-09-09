import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppSidebar() {
    const { url } = usePage();

    const [collapsed, setCollapsed] = useState(false);

    const linkClass = (path: string) => {
        const active = url.startsWith(path);

        return `
            flex items-center gap-3 rounded-lg px-4 py-3
            transition
            ${
                active
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
            }
        `;
    };

    return (
        <aside
            className={`
                min-h-screen border-r bg-white p-4 transition-all duration-300
                ${collapsed ? 'w-20' : 'w-64'}
            `}
        >

            {/* BOTÓN OCULTAR / MOSTRAR */}
            <div className="mb-6 flex items-center justify-between">

                {!collapsed && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Administración
                        </h2>

                        <p className="text-sm text-gray-500">
                            Panel de control
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-md border px-3 py-2 hover:bg-gray-100"
                    title={collapsed ? 'Mostrar menú' : 'Ocultar menú'}
                >
                    {collapsed ? '→' : '←'}
                </button>

            </div>


            <nav className="space-y-2">

                <Link
                    href="/usuarios"
                    className={linkClass('/usuarios')}
                >
                    <span></span>

                    {!collapsed && (
                        <span>Usuarios</span>
                    )}
                </Link>


                <Link
                    href="/empresas"
                    className={linkClass('/empresas')}
                >
                    <span></span>

                    {!collapsed && (
                        <span>Empresas</span>
                    )}
                </Link>


                <Link
                    href="/departamentos"
                    className={linkClass('/departamentos')}
                >
                    <span></span>

                    {!collapsed && (
                        <span>Departamentos</span>
                    )}
                </Link>

            </nav>

        </aside>
    );
}
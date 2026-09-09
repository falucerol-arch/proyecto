import { Head } from '@inertiajs/react';

import AppSidebar from '@/components/AppSidebar';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Company {
    id: number;
    name: string;
    country: string | null;
    users_count: number;
}

interface Props {
    companies: Company[];
}

export default function Index({ companies }: Props) {
    return (
        <div className="flex min-h-screen bg-gray-50">

            <AppSidebar />

            <main className="min-w-0 flex-1 p-8">

                <Head title="Empresas" />

                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Empresas
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Administra las empresas registradas en el sistema.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
                    >
                        + Agregar empresa
                    </button>

                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <Table>

                        <TableHeader>
                            <TableRow className="bg-gray-50">

                                <TableHead>
                                    Nombre
                                </TableHead>

                                <TableHead>
                                    País
                                </TableHead>

                                <TableHead>
                                    Usuarios
                                </TableHead>

                            </TableRow>
                        </TableHeader>

                        <TableBody>

                            {companies.map((company) => (

                                <TableRow
                                    key={company.id}
                                    className="cursor-pointer hover:bg-gray-50"
                                >

                                    <TableCell className="font-medium">
                                        {company.name}
                                    </TableCell>

                                    <TableCell>
                                        {company.country || 'Sin país'}
                                    </TableCell>

                                    <TableCell>
                                        {company.users_count}
                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                </div>

            </main>

        </div>
    );
}
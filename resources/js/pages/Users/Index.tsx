import { Head } from '@inertiajs/react';
// Importamos los componentes de la tabla que acabamos de instalar
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company: { name: string };
    department: { name: string };
}

interface Props {
    users: User[];
}

export default function Index({ users }: Props) {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Head title="Lista de Usuarios" />
            
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Directorio de Usuarios</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-600">Nombre Completo</TableHead>
                            <TableHead className="font-semibold text-gray-600">Correo Electrónico</TableHead>
                            <TableHead className="font-semibold text-gray-600">Empresa</TableHead>
                            <TableHead className="font-semibold text-gray-600">Departamento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell className="text-gray-500">{user.email}</TableCell>
                                <TableCell className="text-gray-600">{user.company.name}</TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                        {user.department.name}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
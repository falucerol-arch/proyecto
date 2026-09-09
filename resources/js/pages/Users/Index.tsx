import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import AppSidebar from '@/components/AppSidebar';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
}

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company: Company;
    department: Department;
    photo_path?: string | null;
    created_at: string;
   updated_at: string;
}

interface Props {
    users: User[];
    companies: Company[];
    departments: Department[];
}


export default function Index({
    users,
    companies,
    departments,
}: Props) {

    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [isEditing, setIsEditing] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    const {
        data,
        setData,
        patch,
        processing,
        errors,
        clearErrors,
    } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        company_id: '',
        department_id: '',
    });


    // =========================
    // ABRIR MODO EDICIÓN
    // =========================
    const startEditing = () => {
        if (!selectedUser) return;

        clearErrors();

        setData({
            first_name: selectedUser.first_name,
            last_name: selectedUser.last_name,
            email: selectedUser.email,
            company_id: String(selectedUser.company.id),
            department_id: String(selectedUser.department.id),
        });

        setIsEditing(true);
    };


    // =========================
    // GUARDAR CAMBIOS
    // =========================
    const submit = (e: FormEvent) => {
        e.preventDefault();
        const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-GT', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

        if (!selectedUser) return;

        patch(`/usuarios/${selectedUser.id}`, {
            preserveScroll: true,
            preserveState: false,

            onSuccess: () => {
                setIsEditing(false);
                setSelectedUser(null);
            },
        });
    };


    // =========================
    // CERRAR MODAL
    // =========================
    const closeDialog = () => {
        setSelectedUser(null);
        setIsEditing(false);
        clearErrors();
    };


    // ABRIR CONFIRMACIÓN

    const deleteUser = () => {
        if (!selectedUser) return;

        setShowDeleteConfirm(true);
    };


    // CONFIRMAR ELIMINACIÓN
    const confirmDelete = () => {
        if (!selectedUser) return;

        router.delete(`/usuarios/${selectedUser.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setShowDeleteConfirm(false);
                setSelectedUser(null);
                setIsEditing(false);
            },
        });
    };
    const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-GT', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};


    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* MENÚ LATERAL */}
            <AppSidebar />


            {/* CONTENIDO PRINCIPAL */}
            <main className="min-w-0 flex-1 p-8">

                <Head title="Lista de Usuarios" />


                {/* TÍTULO */}
                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Personal 
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Personal registrado.
                        </p>
                    </div>


                    <Link
                        href="/usuarios/crear"
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Registrar usuario
                    </Link>

                </div>


                {/* TABLA */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <Table>

                            <TableHeader>

                                <TableRow className="bg-gray-50">

                                    <TableHead className="font-semibold text-gray-600">
                                        Nombre Completo
                                    </TableHead>

                                    <TableHead className="font-semibold text-gray-600">
                                        Correo Electrónico
                                    </TableHead>

                                    <TableHead className="font-semibold text-gray-600">
                                        Departamento
                                    </TableHead>
                                    

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {users.map((user) => (

                                    <TableRow
                                        key={user.id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setIsEditing(false);
                                        }}
                                        className="cursor-pointer transition-colors hover:bg-gray-50"
                                    >

                                        <TableCell className="font-medium text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </TableCell>


                                        <TableCell className="text-gray-500">
                                            {user.email}
                                        </TableCell>


                                        <TableCell>
                                            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
                                                {user.department.name}
                                            </span>
                                        </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </div>

                </div>

                {/* MODAL INFORMACIÓN / EDICIÓN */}

                <Dialog
                    open={selectedUser !== null}
                    onOpenChange={(open) => {
                        if (!open && !showDeleteConfirm) {
                            closeDialog();
                        }
                    }}
                >

                    <DialogContent className="p-8 sm:max-w-2xl">

                        <DialogHeader>

                            <DialogTitle className="text-xl">
                                {isEditing
                                    ? 'Editar usuario'
                                    : 'Información del usuario'}
                            </DialogTitle>

                        </DialogHeader>


                        {/* INFORMACIÓN DEL USUARIO */}

                        {selectedUser && !isEditing && (

                            <div className="space-y-6">

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Nombre
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedUser.first_name}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Apellido
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedUser.last_name}
                                        </p>
                                    </div>


                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-gray-500">
                                            Correo electrónico
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedUser.email}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Empresa
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedUser.company.name}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Departamento
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedUser.department.name}
                                        </p>
                                    </div>

                                    <div>
    <p className="text-sm text-gray-500">
        Creado el
    </p>

    <p className="mt-1 font-medium text-gray-900">
        {formatDate(selectedUser.created_at)}
    </p>
</div>

<div>
    <p className="text-sm text-gray-500">
        Última actualización
    </p>

    <p className="mt-1 font-medium text-gray-900">
        {formatDate(selectedUser.updated_at)}
    </p>
</div>

                                </div>
                                


                                <div className="flex justify-between border-t pt-5">

                                    <button
                                        type="button"
                                        onClick={deleteUser}
                                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                                    >
                                        Eliminar
                                    </button>


                                    <button
                                        type="button"
                                        onClick={startEditing}
                                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                        Editar
                                    </button>

                                </div>

                            </div>

                        )}


                        {/* FORMULARIO DE EDICIÓN */}
                        {selectedUser && isEditing && (

                            <form
                                onSubmit={submit}
                                className="space-y-4"
                            >

                                <div className="grid gap-4 sm:grid-cols-2">

                                    {/* NOMBRE */}
                                    <div>

                                        <label className="text-sm font-medium">
                                            Nombre
                                        </label>

                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                setData(
                                                    'first_name',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        />

                                        {errors.first_name && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.first_name}
                                            </p>
                                        )}

                                    </div>


                                    {/* APELLIDO */}
                                    <div>

                                        <label className="text-sm font-medium">
                                            Apellido
                                        </label>

                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                setData(
                                                    'last_name',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        />

                                        {errors.last_name && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.last_name}
                                            </p>
                                        )}

                                    </div>

                                </div>


                                {/* CORREO */}
                                <div>

                                    <label className="text-sm font-medium">
                                        Correo electrónico
                                    </label>

                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />

                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.email}
                                        </p>
                                    )}

                                </div>


                                <div className="grid gap-4 sm:grid-cols-2">

                                    {/* EMPRESA */}
                                    <div>

                                        <label className="text-sm font-medium">
                                            Empresa
                                        </label>

                                        <select
                                            value={data.company_id}
                                            onChange={(e) =>
                                                setData(
                                                    'company_id',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        >

                                            <option value="">
                                                Selecciona una empresa
                                            </option>

                                            {companies.map((company) => (

                                                <option
                                                    key={company.id}
                                                    value={company.id}
                                                >
                                                    {company.name}
                                                </option>

                                            ))}

                                        </select>

                                        {errors.company_id && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.company_id}
                                            </p>
                                        )}

                                    </div>


                                    {/* DEPARTAMENTO */}
                                    <div>

                                        <label className="text-sm font-medium">
                                            Departamento
                                        </label>

                                        <select
                                            value={data.department_id}
                                            onChange={(e) =>
                                                setData(
                                                    'department_id',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        >

                                            <option value="">
                                                Selecciona un departamento
                                            </option>

                                            {departments.map((department) => (

                                                <option
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.name}
                                                </option>

                                            ))}

                                        </select>

                                        {errors.department_id && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.department_id}
                                            </p>
                                        )}

                                    </div>

                                </div>


                                {/* BOTONES */}
                                <div className="flex justify-end gap-3 border-t pt-5">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            clearErrors();
                                        }}
                                        className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar cambios'}
                                    </button>

                                </div>

                            </form>

                        )}

                    </DialogContent>

                </Dialog>


                {/* ========================================= */}
                {/* CONFIRMACIÓN PARA ELIMINAR */}
                {/* ========================================= */}

                <AlertDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                >

                    <AlertDialogContent>

                        <AlertDialogHeader>

                            <AlertDialogTitle>
                                ¿Eliminar usuario?
                            </AlertDialogTitle>


                            <AlertDialogDescription>

                                {selectedUser && (
                                    <>
                                        ¿Seguro que deseas eliminar a{' '}

                                        <strong className="text-gray-900">
                                            {selectedUser.first_name}{' '}
                                            {selectedUser.last_name}
                                        </strong>

                                        ? Esta acción no se puede deshacer.
                                    </>
                                )}

                            </AlertDialogDescription>

                        </AlertDialogHeader>


                        <AlertDialogFooter>

                            <AlertDialogCancel>
                                Cancelar
                            </AlertDialogCancel>


                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Sí, eliminar
                            </AlertDialogAction>

                        </AlertDialogFooter>

                    </AlertDialogContent>

                </AlertDialog>

            </main>

        </div>
    );
}
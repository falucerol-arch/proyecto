import { Head, router, useForm } from '@inertiajs/react';
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


interface Department {
    id: number;
    name: string;
    users_count: number;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    departments: Department[];
}


export default function Index({ departments }: Props) {

    // =========================
    // ESTADOS
    // =========================

    const [showCreate, setShowCreate] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const [isEditing, setIsEditing] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    // =========================
    // FORMULARIO CREAR
    // =========================

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
    });


    // =========================
    // FORMULARIO EDITAR
    // =========================

    const editForm = useForm({
        name: '',
    });


    // =========================
    // CREAR DEPARTAMENTO
    // =========================

    const submitDepartment = (e: FormEvent) => {
        e.preventDefault();

        post('/departamentos', {
            preserveScroll: true,

            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };


    // =========================
    // CERRAR MODAL CREAR
    // =========================

    const closeCreate = () => {
        setShowCreate(false);
        reset();
        clearErrors();
    };


    // =========================
    // ABRIR DEPARTAMENTO
    // =========================

    const openDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setIsEditing(false);
        editForm.clearErrors();
    };


    // =========================
    // ACTIVAR EDICIÓN
    // =========================

    const startEditing = () => {
        if (!selectedDepartment) return;

        editForm.clearErrors();

        editForm.setData({
            name: selectedDepartment.name,
        });

        setIsEditing(true);
    };


    // =========================
    // ACTUALIZAR
    // =========================

    const updateDepartment = (e: FormEvent) => {
        e.preventDefault();

        if (!selectedDepartment) return;

        editForm.patch(`/departamentos/${selectedDepartment.id}`, {
            preserveScroll: true,
            preserveState: false,

            onSuccess: () => {
                setSelectedDepartment(null);
                setIsEditing(false);
                editForm.reset();
            },
        });
    };


    // =========================
    // CERRAR MODAL
    // =========================

    const closeDepartment = () => {
        setSelectedDepartment(null);
        setIsEditing(false);
        setShowDeleteConfirm(false);
        editForm.reset();
        editForm.clearErrors();
    };


    // =========================
    // PEDIR ELIMINACIÓN
    // =========================

    const requestDelete = () => {
        if (!selectedDepartment) return;

        setShowDeleteConfirm(true);
    };


    // =========================
    // CONFIRMAR ELIMINACIÓN
    // =========================

    const confirmDelete = () => {
        if (!selectedDepartment) return;

        if (selectedDepartment.users_count > 0) return;

        router.delete(`/departamentos/${selectedDepartment.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setShowDeleteConfirm(false);
                setSelectedDepartment(null);
                setIsEditing(false);
            },
        });
    };


    // =========================
    // FORMATEAR FECHA
    // =========================

    const formatDate = (date?: string) => {
        if (!date) {
            return 'Sin información';
        }

        return new Date(date).toLocaleString('es-GT', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };


    return (
        <div className="flex min-h-screen bg-gray-50">

            <AppSidebar />


            <main className="min-w-0 flex-1 p-8">

                <Head title="Departamentos" />


                {/* TÍTULO */}
                <div className="mb-6 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Departamentos
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Administra los departamentos registrados en el sistema.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Agregar departamento
                    </button>

                </div>


                {/* TABLA */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <Table>

                            <TableHeader>

                                <TableRow className="bg-gray-50">

                                    <TableHead className="font-semibold text-gray-600">
                                        Nombre
                                    </TableHead>

                                    <TableHead className="font-semibold text-gray-600">
                                        Usuarios
                                    </TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {departments.map((department) => (

                                    <TableRow
                                        key={department.id}
                                        onClick={() => openDepartment(department)}
                                        className="cursor-pointer transition-colors hover:bg-gray-50"
                                    >

                                        <TableCell className="font-medium text-gray-900">
                                            {department.name}
                                        </TableCell>

                                        <TableCell className="text-gray-600">
                                            {department.users_count}
                                        </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </div>

                </div>


                {/* ============================== */}
                {/* MODAL CREAR */}
                {/* ============================== */}

                <Dialog
                    open={showCreate}
                    onOpenChange={(open) => {
                        if (!open) {
                            closeCreate();
                        }
                    }}
                >

                    <DialogContent className="sm:max-w-lg">

                        <DialogHeader>

                            <DialogTitle>
                                Nuevo departamento
                            </DialogTitle>

                        </DialogHeader>


                        <form
                            onSubmit={submitDepartment}
                            className="space-y-5"
                        >

                            <div>

                                <label className="text-sm font-medium text-gray-700">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                                    placeholder="Nombre del departamento"
                                />

                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}

                            </div>


                            <div className="flex justify-end gap-3 border-t pt-5">

                                <button
                                    type="button"
                                    onClick={closeCreate}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar departamento'}
                                </button>

                            </div>

                        </form>

                    </DialogContent>

                </Dialog>


                {/* ============================== */}
                {/* MODAL INFORMACIÓN / EDICIÓN */}
                {/* ============================== */}

                <Dialog
                    open={selectedDepartment !== null}
                    onOpenChange={(open) => {
                        if (!open && !showDeleteConfirm) {
                            closeDepartment();
                        }
                    }}
                >

                    <DialogContent className="p-8 sm:max-w-xl">

                        <DialogHeader>

                            <DialogTitle className="text-xl">

                                {isEditing
                                    ? 'Editar departamento'
                                    : 'Información del departamento'}

                            </DialogTitle>

                        </DialogHeader>


                        {/* INFORMACIÓN */}
                        {selectedDepartment && !isEditing && (

                            <div className="space-y-6">

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Nombre
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedDepartment.name}
                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Usuarios asociados
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedDepartment.users_count}
                                        </p>

                                    </div>


                                    <div className="space-y-5">

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Creado el
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {formatDate(
                                                    selectedDepartment.created_at
                                                )}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Última actualización
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {formatDate(
                                                    selectedDepartment.updated_at
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="flex justify-between border-t pt-5">

                                    <button
                                        type="button"
                                        onClick={requestDelete}
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


                        {/* EDICIÓN */}
                        {selectedDepartment && isEditing && (

                            <form
                                onSubmit={updateDepartment}
                                className="space-y-5"
                            >

                                <div>

                                    <label className="text-sm font-medium text-gray-700">
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'name',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                                    />

                                    {editForm.errors.name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {editForm.errors.name}
                                        </p>
                                    )}

                                </div>


                                <div className="flex justify-end gap-3 border-t pt-5">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            editForm.clearErrors();
                                        }}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {editForm.processing
                                            ? 'Guardando...'
                                            : 'Guardar cambios'}
                                    </button>

                                </div>

                            </form>

                        )}

                    </DialogContent>

                </Dialog>


                {/* ============================== */}
                {/* CONFIRMACIÓN ELIMINAR */}
                {/* ============================== */}

                <AlertDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                >

                    <AlertDialogContent>

                        {selectedDepartment &&
                        selectedDepartment.users_count > 0 ? (

                            <>
                                <AlertDialogHeader>

                                    <AlertDialogTitle>
                                        No se puede eliminar
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>

                                        El departamento{' '}

                                        <strong>
                                            {selectedDepartment.name}
                                        </strong>{' '}

                                        tiene {selectedDepartment.users_count}{' '}
                                        usuario(s) asociado(s).

                                        Debes cambiar o eliminar esos usuarios
                                        antes de eliminar el departamento.

                                    </AlertDialogDescription>

                                </AlertDialogHeader>


                                <AlertDialogFooter>

                                    <AlertDialogCancel>
                                        Cerrar
                                    </AlertDialogCancel>

                                </AlertDialogFooter>

                            </>

                        ) : (

                            <>
                                <AlertDialogHeader>

                                    <AlertDialogTitle>
                                        ¿Eliminar departamento?
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>

                                        ¿Seguro que deseas eliminar{' '}

                                        <strong>
                                            {selectedDepartment?.name}
                                        </strong>

                                        ? Esta acción no se puede deshacer.

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

                            </>

                        )}

                    </AlertDialogContent>

                </AlertDialog>

            </main>

        </div>
    );
}
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


interface Company {
    id: number;
    name: string;
    country: string | null;
    users_count: number;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    companies: Company[];
}


export default function Index({ companies }: Props) {

    // =========================================
    // ESTADOS
    // =========================================

    // Modal para crear empresa
    const [showCreate, setShowCreate] = useState(false);

    // Empresa seleccionada al hacer clic
    const [selectedCompany, setSelectedCompany] =
        useState<Company | null>(null);

    // false = información
    // true = editar
    const [isEditing, setIsEditing] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    // =========================================
    // FORMULARIO CREAR EMPRESA
    // =========================================

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
        country: '',
    });


    // =========================================
    // FORMULARIO EDITAR EMPRESA
    // =========================================

    const editForm = useForm({
        name: '',
        country: '',
    });


    // =========================================
    // CREAR EMPRESA
    // =========================================

    const submitCompany = (e: FormEvent) => {
        e.preventDefault();

        post('/empresas', {
            preserveScroll: true,

            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };


    // =========================================
    // CERRAR MODAL CREAR
    // =========================================

    const closeCreate = () => {
        setShowCreate(false);
        reset();
        clearErrors();
    };


    // =========================================
    // ABRIR EMPRESA
    // =========================================

    const openCompany = (company: Company) => {
        setSelectedCompany(company);
        setIsEditing(false);
        editForm.clearErrors();
    };


    const requestDelete = () => {
    if (!selectedCompany) return;

    setShowDeleteConfirm(true);
};

const confirmDelete = () => {
    if (!selectedCompany) return;

    // Seguridad también desde React
    if (selectedCompany.users_count > 0) return;

    router.delete(`/empresas/${selectedCompany.id}`, {
        preserveScroll: true,

        onSuccess: () => {
            setShowDeleteConfirm(false);
            setSelectedCompany(null);
            setIsEditing(false);
        },
    });
};


    // =========================================
    // ACTIVAR EDICIÓN
    // =========================================

    const startEditing = () => {
        if (!selectedCompany) return;

        editForm.clearErrors();

        editForm.setData({
            name: selectedCompany.name,
            country: selectedCompany.country ?? '',
        });

        setIsEditing(true);
    };


    // =========================================
    // ACTUALIZAR EMPRESA
    // =========================================

    const updateCompany = (e: FormEvent) => {
        e.preventDefault();

        if (!selectedCompany) return;

        editForm.patch(`/empresas/${selectedCompany.id}`, {
            preserveScroll: true,
            preserveState: false,

            onSuccess: () => {
                setSelectedCompany(null);
                setIsEditing(false);
                editForm.reset();
            },
        });
    };


    // =========================================
    // CERRAR MODAL INFORMACIÓN
    // =========================================

    const closeCompany = () => {
        setSelectedCompany(null);
        setIsEditing(false);
        editForm.reset();
        editForm.clearErrors();
    };


    // =========================================
    // FORMATEAR FECHA
    // =========================================

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

            {/* BARRA LATERAL */}
            <AppSidebar />


            {/* CONTENIDO */}
            <main className="min-w-0 flex-1 p-8">

                <Head title="Empresas" />


                {/* ========================================= */}
                {/* TÍTULO */}
                {/* ========================================= */}

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
                        onClick={() => setShowCreate(true)}
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Agregar empresa
                    </button>

                </div>


                {/* ========================================= */}
                {/* TABLA */}
                {/* ========================================= */}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <Table>

                            <TableHeader>

                                <TableRow className="bg-gray-50">

                                    <TableHead className="font-semibold text-gray-600">
                                        Nombre
                                    </TableHead>

                                    <TableHead className="font-semibold text-gray-600">
                                        País
                                    </TableHead>

                                    <TableHead className="font-semibold text-gray-600">
                                        Usuarios
                                    </TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {companies.map((company) => (

                                    <TableRow
                                        key={company.id}
                                        onClick={() => openCompany(company)}
                                        className="cursor-pointer transition-colors hover:bg-gray-50"
                                    >

                                        <TableCell className="font-medium text-gray-900">
                                            {company.name}
                                        </TableCell>


                                        <TableCell className="text-gray-600">
                                            {company.country || 'Sin país'}
                                        </TableCell>


                                        <TableCell className="text-gray-600">
                                            {company.users_count}
                                        </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </div>

                </div>


                {/* ========================================= */}
                {/* MODAL CREAR EMPRESA */}
                {/* ========================================= */}

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
                                Nueva empresa
                            </DialogTitle>

                        </DialogHeader>


                        <form
                            onSubmit={submitCompany}
                            className="space-y-5"
                        >

                            {/* NOMBRE */}
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
                                    placeholder="Nombre de la empresa"
                                />

                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}

                            </div>


                            {/* PAÍS */}
                            <div>

                                <label className="text-sm font-medium text-gray-700">
                                    País
                                </label>

                                <input
                                    type="text"
                                    value={data.country}
                                    onChange={(e) =>
                                        setData('country', e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                                    placeholder="Guatemala"
                                />

                                {errors.country && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.country}
                                    </p>
                                )}

                            </div>


                            {/* BOTONES */}
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
                                        : 'Guardar empresa'}
                                </button>

                            </div>

                        </form>

                    </DialogContent>

                </Dialog>


                {/* ========================================= */}
                {/* MODAL INFORMACIÓN / EDITAR EMPRESA */}
                {/* ========================================= */}

                <Dialog
                    open={selectedCompany !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            closeCompany();
                        }
                    }}
                >

                    <DialogContent className="p-8 sm:max-w-xl">

                        <DialogHeader>

                            <DialogTitle className="text-xl">
                                {isEditing
                                    ? 'Editar empresa'
                                    : 'Información de la empresa'}
                            </DialogTitle>

                        </DialogHeader>

                        <AlertDialog
    open={showDeleteConfirm}
    onOpenChange={setShowDeleteConfirm}
>
    <AlertDialogContent>

        {selectedCompany && selectedCompany.users_count > 0 ? (
            <>
                <AlertDialogHeader>

                    <AlertDialogTitle>
                        No se puede eliminar
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        La empresa{' '}
                        <strong>
                            {selectedCompany.name}
                        </strong>{' '}
                        tiene {selectedCompany.users_count}{' '}
                        usuario(s) asociado(s).

                        Debes cambiar o eliminar esos usuarios antes
                        de eliminar la empresa.
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
                        ¿Eliminar empresa?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        ¿Seguro que deseas eliminar{' '}
                        <strong>
                            {selectedCompany?.name}
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


                        {/* ================================= */}
                        {/* INFORMACIÓN */}
                        {/* ================================= */}

                        {selectedCompany && !isEditing && (

                            <div className="space-y-6">

                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* NOMBRE */}
                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Nombre
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedCompany.name}
                                        </p>

                                    </div>


                                    {/* PAÍS */}
                                    <div>

                                        <p className="text-sm text-gray-500">
                                            País
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedCompany.country || 'Sin país'}
                                        </p>

                                    </div>


                                    {/* USUARIOS */}
                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Usuarios asociados
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {selectedCompany.users_count}
                                        </p>

                                    </div>


                                    {/* FECHAS */}
                                    <div className="space-y-5">

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Creado el
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {formatDate(
                                                    selectedCompany.created_at
                                                )}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Última actualización
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {formatDate(
                                                    selectedCompany.updated_at
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


                        {/* ================================= */}
                        {/* EDITAR */}
                        {/* ================================= */}

                        {selectedCompany && isEditing && (

                            <form
                                onSubmit={updateCompany}
                                className="space-y-5"
                            >

                                {/* NOMBRE */}
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


                                {/* PAÍS */}
                                <div>

                                    <label className="text-sm font-medium text-gray-700">
                                        País
                                    </label>

                                    <input
                                        type="text"
                                        value={editForm.data.country}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'country',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                                    />

                                    {editForm.errors.country && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {editForm.errors.country}
                                        </p>
                                    )}

                                </div>


                                {/* BOTONES */}
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

            </main>

        </div>
    );
}
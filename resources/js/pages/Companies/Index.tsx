import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
    created_at: string;
    updated_at: string;
}


interface Props {
    companies: Company[];
}


type SortField =
    | 'name'
    | 'country'
    | 'users';

type SortDirection =
    | 'asc'
    | 'desc';


export default function Index({
    companies,
}: Props) {

    // Guarda la empresa seleccionada de la tabla
    const [
        selectedCompany,
        setSelectedCompany,
    ] = useState<Company | null>(null);

    // Indica si se está editando una empresa
    const [isEditing, setIsEditing] =
        useState(false);

    // Abre o cierra el formulario de registro
    const [
        showCreateCompany,
        setShowCreateCompany,
    ] = useState(false);

    // Abre o cierra la confirmación para eliminar
    const [
        showDeleteConfirm,
        setShowDeleteConfirm,
    ] = useState(false);


    // Guarda lo escrito en el buscador
    const [searchTerm, setSearchTerm] =
        useState('');

    // Guarda la página actual
    const [currentPage, setCurrentPage] =
        useState(1);

    // Cantidad máxima de empresas mostradas
    const companiesPerPage = 10;


    // Guarda la columna utilizada para ordenar
    const [sortField, setSortField] =
        useState<SortField>('name');

    // Guarda el tipo de orden
    const [sortDirection, setSortDirection] =
        useState<SortDirection>('asc');


    // Formulario utilizado para registrar empresas
    const createForm = useForm({
        name: '',
        country: '',
    });


    // Formulario utilizado para editar empresas
    const editForm = useForm({
        name: '',
        country: '',
    });


    // Esta función registra una nueva empresa
    const submitCreate = (
        e: FormEvent
    ) => {

        e.preventDefault();


        createForm.post(
            '/empresas',
            {
                preserveScroll: true,

                onSuccess: () => {

                    createForm.reset();

                    createForm.clearErrors();

                    setShowCreateCompany(
                        false
                    );
                },
            }
        );
    };


    // Esta función cierra el formulario de registro
    const closeCreateCompany = () => {

        setShowCreateCompany(false);

        createForm.reset();

        createForm.clearErrors();
    };


    // Esta función carga los datos de la empresa para poder editarlos
    const startEditing = () => {

        if (!selectedCompany) return;


        editForm.clearErrors();


        editForm.setData({
            name:
                selectedCompany.name,

            country:
                selectedCompany.country ??
                '',
        });


        setIsEditing(true);
    };


    // Esta función guarda los cambios de la empresa
    const submitEdit = (
        e: FormEvent
    ) => {

        e.preventDefault();


        if (!selectedCompany) return;


        editForm.patch(
            `/empresas/${selectedCompany.id}`,
            {
                preserveScroll: true,

                preserveState: false,

                onSuccess: () => {

                    setIsEditing(false);

                    setSelectedCompany(
                        null
                    );
                },
            }
        );
    };


    // Esta función cancela la edición
    const cancelEditing = () => {

        editForm.reset();

        editForm.clearErrors();

        setIsEditing(false);
    };


    // Esta función cierra la información de la empresa
    const closeDialog = () => {

        setSelectedCompany(null);

        setIsEditing(false);

        editForm.clearErrors();
    };


    // Esta función abre la confirmación para eliminar
    const deleteCompany = () => {

        if (!selectedCompany) return;

        setShowDeleteConfirm(true);
    };


    // Esta función elimina la empresa cuando no tiene usuarios
    const confirmDelete = () => {

        if (!selectedCompany) return;


        if (
            selectedCompany.users_count >
            0
        ) {
            return;
        }


        router.delete(
            `/empresas/${selectedCompany.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {

                    setShowDeleteConfirm(
                        false
                    );

                    setSelectedCompany(
                        null
                    );

                    setIsEditing(false);
                },
            }
        );
    };


    // Esta función cambia el orden ascendente o descendente
    const handleSort = (
        field: SortField
    ) => {

        if (sortField === field) {

            setSortDirection(
                sortDirection === 'asc'
                    ? 'desc'
                    : 'asc'
            );

        } else {

            setSortField(field);

            setSortDirection('asc');
        }


        setCurrentPage(1);
    };


    // Busca empresas por nombre o país
    const filteredCompanies =
        companies.filter((company) => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            return (
                company.name
                    .toLowerCase()
                    .includes(search) ||

                (
                    company.country ??
                    ''
                )
                    .toLowerCase()
                    .includes(search)
            );
        });


    // Ordena las empresas antes de mostrarlas
    const sortedCompanies =
        [...filteredCompanies].sort(
            (a, b) => {

                // Si se selecciona Usuarios el orden se realiza con números
                if (
                    sortField ===
                    'users'
                ) {

                    return sortDirection ===
                        'asc'
                        ? a.users_count -
                              b.users_count
                        : b.users_count -
                              a.users_count;
                }


                let valueA = '';
                let valueB = '';


                if (
                    sortField ===
                    'name'
                ) {

                    valueA = a.name;

                    valueB = b.name;
                }


                if (
                    sortField ===
                    'country'
                ) {

                    valueA =
                        a.country ?? '';

                    valueB =
                        b.country ?? '';
                }


                const result =
                    valueA.localeCompare(
                        valueB,
                        'es',
                        {
                            sensitivity:
                                'base',
                        }
                    );


                return sortDirection ===
                    'asc'
                    ? result
                    : -result;
            }
        );


    // Calcula el número total de páginas
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                sortedCompanies.length /
                    companiesPerPage
            )
        );


    // Evita que la página actual quede fuera del rango
    useEffect(() => {

        if (
            currentPage >
            totalPages
        ) {

            setCurrentPage(
                totalPages
            );
        }

    }, [
        currentPage,
        totalPages,
    ]);


    const startIndex =
        (currentPage - 1) *
        companiesPerPage;


    // Obtiene únicamente las empresas de la página actual
    const visibleCompanies =
        sortedCompanies.slice(
            startIndex,
            startIndex +
                companiesPerPage
        );


    // Esta función muestra las fechas en formato de Guatemala
    const formatDate = (
        date: string
    ) => {

        return new Date(
            date
        ).toLocaleString(
            'es-GT',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            }
        );
    };


    return (
        <div className="flex min-h-screen bg-gray-50">

            <AppSidebar />


            <main className="min-w-0 flex-1 p-8">

                <Head title="Empresas" />


                {/* Encabezado */}
                <div className="mb-6 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Empresas
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Empresas registradas.
                        </p>

                    </div>


                    {/* Este botón abre el formulario para registrar una empresa */}
                    <button
                        type="button"

                        onClick={() =>
                            setShowCreateCompany(
                                true
                            )
                        }

                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        + Agregar empresa
                    </button>

                </div>


                {/* Este campo permite buscar una empresa por nombre o país */}
                <div className="mb-4">

                    <input
                        type="text"

                        placeholder="Buscar por empresa o país..."

                        value={
                            searchTerm
                        }

                        onChange={(e) => {

                            setSearchTerm(
                                e.target.value
                            );

                            setCurrentPage(
                                1
                            );
                        }}

                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-500 sm:max-w-md"
                    />

                </div>


                {/* Tabla de empresas */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <Table>

                            <TableHeader>

                                <TableRow className="bg-gray-50">

                                    <TableHead>

                                        {/* Este botón ordena las empresas por nombre */}
                                        <button
                                            type="button"

                                            onClick={() =>
                                                handleSort(
                                                    'name'
                                                )
                                            }

                                            className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                        >
                                            Empresa

                                            {sortField ===
                                                'name' && (

                                                <span>
                                                    {
                                                        sortDirection ===
                                                        'asc'
                                                            ? '↑'
                                                            : '↓'
                                                    }
                                                </span>

                                            )}

                                        </button>

                                    </TableHead>


                                    <TableHead>

                                        {/* Este botón ordena las empresas por país */}
                                        <button
                                            type="button"

                                            onClick={() =>
                                                handleSort(
                                                    'country'
                                                )
                                            }

                                            className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                        >
                                            País

                                            {sortField ===
                                                'country' && (

                                                <span>
                                                    {
                                                        sortDirection ===
                                                        'asc'
                                                            ? '↑'
                                                            : '↓'
                                                    }
                                                </span>

                                            )}

                                        </button>

                                    </TableHead>


                                    <TableHead>

                                        {/* Este botón ordena las empresas por cantidad de usuarios */}
                                        <button
                                            type="button"

                                            onClick={() =>
                                                handleSort(
                                                    'users'
                                                )
                                            }

                                            className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                        >
                                            Usuarios

                                            {sortField ===
                                                'users' && (

                                                <span>
                                                    {
                                                        sortDirection ===
                                                        'asc'
                                                            ? '↑'
                                                            : '↓'
                                                    }
                                                </span>

                                            )}

                                        </button>

                                    </TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {visibleCompanies.length ===
                                    0 && (

                                    <TableRow>

                                        <TableCell
                                            colSpan={
                                                3
                                            }
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No se encontraron empresas.
                                        </TableCell>

                                    </TableRow>

                                )}


                                {visibleCompanies.map(
                                    (company) => (

                                        <TableRow
                                            key={
                                                company.id
                                            }

                                            // Al hacer clic abre la información de la empresa
                                            onClick={() => {

                                                setSelectedCompany(
                                                    company
                                                );

                                                setIsEditing(
                                                    false
                                                );
                                            }}

                                            className="cursor-pointer hover:bg-gray-50"
                                        >

                                            <TableCell className="font-medium">
                                                {
                                                    company.name
                                                }
                                            </TableCell>


                                            <TableCell className="text-gray-500">

                                                {
                                                    company.country ??
                                                    'Sin país'
                                                }

                                            </TableCell>


                                            <TableCell>
                                                {
                                                    company.users_count
                                                }
                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </div>

                </div>


                {/* Esta parte permite cambiar entre las páginas */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">

                        Mostrando{' '}

                        {filteredCompanies.length ===
                        0
                            ? 0
                            : startIndex +
                              1}

                        {' - '}

                        {Math.min(
                            startIndex +
                                companiesPerPage,

                            filteredCompanies.length
                        )}

                        {' de '}

                        {
                            filteredCompanies.length
                        }

                        {' empresas'}

                    </p>


                    <div className="flex items-center gap-2">

                        {/* Este botón muestra la página anterior */}
                        <button
                            type="button"

                            disabled={
                                currentPage ===
                                1
                            }

                            onClick={() =>
                                setCurrentPage(
                                    (page) =>
                                        Math.max(
                                            page -
                                                1,
                                            1
                                        )
                                )
                            }

                            className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
                        >
                            Anterior
                        </button>


                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                        </span>


                        {/* Este botón muestra la página siguiente */}
                        <button
                            type="button"

                            disabled={
                                currentPage >=
                                totalPages
                            }

                            onClick={() =>
                                setCurrentPage(
                                    (page) =>
                                        Math.min(
                                            page +
                                                1,

                                            totalPages
                                        )
                                )
                            }

                            className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40"
                        >
                            Siguiente
                        </button>

                    </div>

                </div>


                {/* Formulario para registrar empresa */}
                <Dialog
                    open={
                        showCreateCompany
                    }

                    onOpenChange={(open) => {

                        if (!open) {
                            closeCreateCompany();
                        }
                    }}
                >

                    <DialogContent className="sm:max-w-lg">

                        <DialogHeader>

                            <DialogTitle>
                                Agregar empresa
                            </DialogTitle>

                        </DialogHeader>


                        <form
                            onSubmit={
                                submitCreate
                            }
                            className="space-y-5"
                        >

                            <div>

                                <label className="text-sm font-medium">
                                    Nombre
                                </label>


                                <input
                                    type="text"

                                    value={
                                        createForm.data.name
                                    }

                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value
                                        )
                                    }

                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                />


                                {createForm.errors.name && (

                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            createForm.errors.name
                                        }
                                    </p>

                                )}

                            </div>


                            <div>

                                <label className="text-sm font-medium">
                                    País
                                </label>


                                <input
                                    type="text"

                                    value={
                                        createForm.data.country
                                    }

                                    onChange={(e) =>
                                        createForm.setData(
                                            'country',
                                            e.target.value
                                        )
                                    }

                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                />


                                {createForm.errors.country && (

                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            createForm.errors.country
                                        }
                                    </p>

                                )}

                            </div>


                            <div className="flex justify-end gap-3 border-t pt-5">

                                {/* Este botón cierra el formulario sin guardar */}
                                <button
                                    type="button"

                                    onClick={
                                        closeCreateCompany
                                    }

                                    className="rounded-lg border px-5 py-2.5 text-sm"
                                >
                                    Cancelar
                                </button>


                                {/* Este botón registra la nueva empresa */}
                                <button
                                    type="submit"

                                    disabled={
                                        createForm.processing
                                    }

                                    className="rounded-lg bg-black px-5 py-2.5 text-sm text-white disabled:opacity-50"
                                >

                                    {createForm.processing
                                        ? 'Guardando...'
                                        : 'Guardar'}

                                </button>

                            </div>

                        </form>

                    </DialogContent>

                </Dialog>


                {/* Ventana para ver o editar una empresa */}
                <Dialog
                    open={
                        selectedCompany !==
                        null
                    }

                    onOpenChange={(open) => {

                        if (
                            !open &&
                            !showDeleteConfirm
                        ) {
                            closeDialog();
                        }
                    }}
                >

                    <DialogContent className="sm:max-w-xl">

                        <DialogHeader>

                            <DialogTitle>

                                {isEditing
                                    ? 'Editar empresa'
                                    : 'Información de la empresa'}

                            </DialogTitle>

                        </DialogHeader>


                        {selectedCompany &&
                            !isEditing && (

                            <div className="space-y-6">

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Empresa
                                        </p>

                                        <p className="mt-1 font-medium">
                                            {
                                                selectedCompany.name
                                            }
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            País
                                        </p>

                                        <p className="mt-1 font-medium">

                                            {
                                                selectedCompany.country ??
                                                'Sin país'
                                            }

                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Usuarios asociados
                                        </p>

                                        <p className="mt-1 font-medium">
                                            {
                                                selectedCompany.users_count
                                            }
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Creado el
                                        </p>

                                        <p className="mt-1 font-medium">

                                            {
                                                formatDate(
                                                    selectedCompany.created_at
                                                )
                                            }

                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Última actualización
                                        </p>

                                        <p className="mt-1 font-medium">

                                            {
                                                formatDate(
                                                    selectedCompany.updated_at
                                                )
                                            }

                                        </p>
                                    </div>

                                </div>


                                <div className="flex justify-between border-t pt-5">

                                    {/* Este botón abre la confirmación para eliminar */}
                                    <button
                                        type="button"

                                        onClick={
                                            deleteCompany
                                        }

                                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm text-white"
                                    >
                                        Eliminar
                                    </button>


                                    {/* Este botón permite editar la empresa */}
                                    <button
                                        type="button"

                                        onClick={
                                            startEditing
                                        }

                                        className="rounded-lg bg-black px-5 py-2.5 text-sm text-white"
                                    >
                                        Editar
                                    </button>

                                </div>

                            </div>

                        )}


                        {selectedCompany &&
                            isEditing && (

                            <form
                                onSubmit={
                                    submitEdit
                                }

                                className="space-y-5"
                            >

                                <div>

                                    <label className="text-sm font-medium">
                                        Nombre
                                    </label>

                                    <input
                                        type="text"

                                        value={
                                            editForm.data.name
                                        }

                                        onChange={(e) =>
                                            editForm.setData(
                                                'name',
                                                e.target.value
                                            )
                                        }

                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />

                                    {editForm.errors.name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {
                                                editForm.errors.name
                                            }
                                        </p>
                                    )}

                                </div>


                                <div>

                                    <label className="text-sm font-medium">
                                        País
                                    </label>

                                    <input
                                        type="text"

                                        value={
                                            editForm.data.country
                                        }

                                        onChange={(e) =>
                                            editForm.setData(
                                                'country',
                                                e.target.value
                                            )
                                        }

                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />

                                    {editForm.errors.country && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {
                                                editForm.errors.country
                                            }
                                        </p>
                                    )}

                                </div>


                                <div className="flex justify-end gap-3 border-t pt-5">

                                    {/* Este botón cancela la edición */}
                                    <button
                                        type="button"

                                        onClick={
                                            cancelEditing
                                        }

                                        className="rounded-lg border px-5 py-2.5 text-sm"
                                    >
                                        Cancelar
                                    </button>


                                    {/* Este botón guarda los cambios */}
                                    <button
                                        type="submit"

                                        disabled={
                                            editForm.processing
                                        }

                                        className="rounded-lg bg-black px-5 py-2.5 text-sm text-white disabled:opacity-50"
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


                {/* Confirmación para eliminar una empresa */}
                <AlertDialog
                    open={
                        showDeleteConfirm
                    }

                    onOpenChange={
                        setShowDeleteConfirm
                    }
                >

                    <AlertDialogContent>

                        <AlertDialogHeader>

                            <AlertDialogTitle>

                                {selectedCompany &&
                                selectedCompany.users_count >
                                    0
                                    ? 'No se puede eliminar'
                                    : '¿Eliminar empresa?'}

                            </AlertDialogTitle>


                            <AlertDialogDescription>

                                {selectedCompany &&
                                selectedCompany.users_count >
                                    0
                                    ? `La empresa tiene ${selectedCompany.users_count} usuario(s) asociado(s).`
                                    : 'Esta acción no se puede deshacer.'}

                            </AlertDialogDescription>

                        </AlertDialogHeader>


                        <AlertDialogFooter>

                            <AlertDialogCancel>

                                {selectedCompany &&
                                selectedCompany.users_count >
                                    0
                                    ? 'Cerrar'
                                    : 'Cancelar'}

                            </AlertDialogCancel>


                            {selectedCompany &&
                                selectedCompany.users_count ===
                                    0 && (

                                /* Este botón elimina definitivamente la empresa */
                                <AlertDialogAction
                                    onClick={
                                        confirmDelete
                                    }

                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Sí, eliminar
                                </AlertDialogAction>

                            )}

                        </AlertDialogFooter>

                    </AlertDialogContent>

                </AlertDialog>

            </main>

        </div>
    );
}
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


interface Department {
    id: number;
    name: string;
    users_count: number;
    created_at: string;
    updated_at: string;
}


interface Props {
    departments: Department[];
}


type SortField =
    | 'name'
    | 'users';

type SortDirection =
    | 'asc'
    | 'desc';


export default function Index({
    departments,
}: Props) {

    // Guarda el departamento seleccionado
    const [
        selectedDepartment,
        setSelectedDepartment,
    ] = useState<Department | null>(null);

    // Indica si se está editando el departamento
    const [isEditing, setIsEditing] =
        useState(false);

    // Abre o cierra el formulario para agregar departamentos
    const [
        showCreateDepartment,
        setShowCreateDepartment,
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

    // Máximo de departamentos mostrados por página
    const departmentsPerPage = 10;


    // Guarda la columna utilizada para ordenar
    const [sortField, setSortField] =
        useState<SortField>('name');

    // Guarda si el orden es ascendente o descendente
    const [sortDirection, setSortDirection] =
        useState<SortDirection>('asc');


    // Formulario para registrar departamentos
    const createForm = useForm({
        name: '',
    });


    // Formulario para editar departamentos
    const editForm = useForm({
        name: '',
    });


    // Esta función registra un departamento nuevo
    const submitCreate = (
        e: FormEvent
    ) => {

        e.preventDefault();


        createForm.post(
            '/departamentos',
            {
                preserveScroll: true,

                onSuccess: () => {

                    createForm.reset();

                    createForm.clearErrors();

                    setShowCreateDepartment(
                        false
                    );
                },
            }
        );
    };


    // Esta función cierra el formulario de registro
    const closeCreateDepartment = () => {

        setShowCreateDepartment(
            false
        );

        createForm.reset();

        createForm.clearErrors();
    };


    // Esta función carga la información para poder editarla
    const startEditing = () => {

        if (
            !selectedDepartment
        ) {
            return;
        }


        editForm.clearErrors();


        editForm.setData(
            'name',
            selectedDepartment.name
        );


        setIsEditing(true);
    };


    // Esta función guarda los cambios del departamento
    const submitEdit = (
        e: FormEvent
    ) => {

        e.preventDefault();


        if (
            !selectedDepartment
        ) {
            return;
        }


        editForm.patch(
            `/departamentos/${selectedDepartment.id}`,
            {
                preserveScroll: true,

                preserveState: false,

                onSuccess: () => {

                    setIsEditing(false);

                    setSelectedDepartment(
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


    // Esta función cierra la información del departamento
    const closeDialog = () => {

        setSelectedDepartment(
            null
        );

        setIsEditing(false);

        editForm.clearErrors();
    };


    // Esta función abre la confirmación para eliminar
    const deleteDepartment = () => {

        if (
            !selectedDepartment
        ) {
            return;
        }


        setShowDeleteConfirm(
            true
        );
    };


    // Esta función elimina el departamento cuando no tiene usuarios asociados
    const confirmDelete = () => {

        if (
            !selectedDepartment
        ) {
            return;
        }


        if (
            selectedDepartment.users_count >
            0
        ) {
            return;
        }


        router.delete(
            `/departamentos/${selectedDepartment.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {

                    setShowDeleteConfirm(
                        false
                    );

                    setSelectedDepartment(
                        null
                    );

                    setIsEditing(
                        false
                    );
                },
            }
        );
    };


    // Esta función cambia entre orden ascendente y descendente
    const handleSort = (
        field: SortField
    ) => {

        if (
            sortField === field
        ) {

            setSortDirection(
                sortDirection ===
                'asc'
                    ? 'desc'
                    : 'asc'
            );

        } else {

            setSortField(field);

            setSortDirection(
                'asc'
            );
        }


        setCurrentPage(1);
    };


    // Busca departamentos utilizando el nombre
    const filteredDepartments =
        departments.filter(
            (department) => {

                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();


                return department.name
                    .toLowerCase()
                    .includes(search);
            }
        );


    // Ordena los departamentos antes de mostrarlos
    const sortedDepartments =
        [...filteredDepartments].sort(
            (a, b) => {

                // Si se ordena por usuarios compara números
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


                const result =
                    a.name.localeCompare(
                        b.name,
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


    // Calcula la cantidad total de páginas
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                sortedDepartments.length /
                    departmentsPerPage
            )
        );


    // Evita quedar en una página que ya no existe
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
        departmentsPerPage;


    // Obtiene solamente los departamentos de la página actual
    const visibleDepartments =
        sortedDepartments.slice(
            startIndex,
            startIndex +
                departmentsPerPage
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

                <Head title="Departamentos" />


                {/* Encabezado */}
                <div className="mb-6 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Departamentos
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Departamentos registrados.
                        </p>

                    </div>


                    {/* Este botón abre el formulario para registrar un departamento */}
                    <button
                        type="button"

                        onClick={() =>
                            setShowCreateDepartment(
                                true
                            )
                        }

                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        + Agregar departamento
                    </button>

                </div>


                {/* Este campo permite buscar departamentos por nombre */}
                <div className="mb-4">

                    <input
                        type="text"

                        placeholder="Buscar departamento..."

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


                {/* Tabla de departamentos */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <Table>

                            <TableHeader>

                                <TableRow className="bg-gray-50">

                                    <TableHead>

                                        {/* Este botón ordena los departamentos por nombre */}
                                        <button
                                            type="button"

                                            onClick={() =>
                                                handleSort(
                                                    'name'
                                                )
                                            }

                                            className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                        >
                                            Departamento

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

                                        {/* Este botón ordena por cantidad de usuarios */}
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

                                {visibleDepartments.length ===
                                    0 && (

                                    <TableRow>

                                        <TableCell
                                            colSpan={
                                                2
                                            }
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No se encontraron departamentos.
                                        </TableCell>

                                    </TableRow>

                                )}


                                {visibleDepartments.map(
                                    (
                                        department
                                    ) => (

                                        <TableRow
                                            key={
                                                department.id
                                            }

                                            // Al hacer clic abre la información del departamento
                                            onClick={() => {

                                                setSelectedDepartment(
                                                    department
                                                );

                                                setIsEditing(
                                                    false
                                                );
                                            }}

                                            className="cursor-pointer hover:bg-gray-50"
                                        >

                                            <TableCell className="font-medium">
                                                {
                                                    department.name
                                                }
                                            </TableCell>


                                            <TableCell>
                                                {
                                                    department.users_count
                                                }
                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </div>

                </div>


                {/* Esta parte permite cambiar entre páginas */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">

                        Mostrando{' '}

                        {filteredDepartments.length ===
                        0
                            ? 0
                            : startIndex +
                              1}

                        {' - '}

                        {Math.min(
                            startIndex +
                                departmentsPerPage,

                            filteredDepartments.length
                        )}

                        {' de '}

                        {
                            filteredDepartments.length
                        }

                        {' departamentos'}

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


                {/* Formulario para registrar departamento */}
                <Dialog
                    open={
                        showCreateDepartment
                    }

                    onOpenChange={(open) => {

                        if (!open) {
                            closeCreateDepartment();
                        }
                    }}
                >

                    <DialogContent className="sm:max-w-lg">

                        <DialogHeader>

                            <DialogTitle>
                                Agregar departamento
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


                            <div className="flex justify-end gap-3 border-t pt-5">

                                {/* Este botón cierra el formulario sin guardar */}
                                <button
                                    type="button"

                                    onClick={
                                        closeCreateDepartment
                                    }

                                    className="rounded-lg border px-5 py-2.5 text-sm"
                                >
                                    Cancelar
                                </button>


                                {/* Este botón registra el nuevo departamento */}
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


                {/* Ventana para ver o editar el departamento */}
                <Dialog
                    open={
                        selectedDepartment !==
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
                                    ? 'Editar departamento'
                                    : 'Información del departamento'}

                            </DialogTitle>

                        </DialogHeader>


                        {selectedDepartment &&
                            !isEditing && (

                            <div className="space-y-6">

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Departamento
                                        </p>

                                        <p className="mt-1 font-medium">
                                            {
                                                selectedDepartment.name
                                            }
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Usuarios asociados
                                        </p>

                                        <p className="mt-1 font-medium">
                                            {
                                                selectedDepartment.users_count
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
                                                    selectedDepartment.created_at
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
                                                    selectedDepartment.updated_at
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
                                            deleteDepartment
                                        }

                                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm text-white"
                                    >
                                        Eliminar
                                    </button>


                                    {/* Este botón permite editar el departamento */}
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


                        {selectedDepartment &&
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


                {/* Confirmación para eliminar un departamento */}
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

                                {selectedDepartment &&
                                selectedDepartment.users_count >
                                    0
                                    ? 'No se puede eliminar'
                                    : '¿Eliminar departamento?'}

                            </AlertDialogTitle>


                            <AlertDialogDescription>

                                {selectedDepartment &&
                                selectedDepartment.users_count >
                                    0
                                    ? `El departamento tiene ${selectedDepartment.users_count} usuario(s) asociado(s).`
                                    : 'Esta acción no se puede deshacer.'}

                            </AlertDialogDescription>

                        </AlertDialogHeader>


                        <AlertDialogFooter>

                            <AlertDialogCancel>

                                {selectedDepartment &&
                                selectedDepartment.users_count >
                                    0
                                    ? 'Cerrar'
                                    : 'Cancelar'}

                            </AlertDialogCancel>


                            {selectedDepartment &&
                                selectedDepartment.users_count ===
                                    0 && (

                                /* Este botón elimina definitivamente el departamento */
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
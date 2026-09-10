import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

import AppSidebar from '@/components/AppSidebar';
import { getCroppedImage } from '@/lib/cropImage';

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


// Información básica de una empresa
interface Company {
    id: number;
    name: string;
}


// Información básica de un departamento
interface Department {
    id: number;
    name: string;
}


// Información que tiene cada usuario
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;

    company: Company;
    department: Department;

    // Puesto o cargo del usuario
    position: string | null;

    photo_path?: string | null;

    created_at: string;
    updated_at: string;
}


// Información recibida desde Laravel
interface Props {
    users: User[];
    companies: Company[];
    departments: Department[];
}


// Columnas que se pueden ordenar
type SortField =
    | 'name'
    | 'email'
    | 'department';


// Tipos de orden
type SortDirection =
    | 'asc'
    | 'desc';


export default function Index({
    users,
    companies,
    departments,
}: Props) {

    // Guarda el usuario seleccionado de la tabla
    const [selectedUser, setSelectedUser] =
        useState<User | null>(null);

    // Indica si se está editando el usuario
    const [isEditing, setIsEditing] =
        useState(false);

    // Muestra la confirmación para eliminar
    const [
        showDeleteConfirm,
        setShowDeleteConfirm,
    ] = useState(false);

    // Muestra el formulario para registrar usuario
    const [
        showCreateUser,
        setShowCreateUser,
    ] = useState(false);


    // Guarda la vista previa de la foto al registrar
    const [
        photoPreview,
        setPhotoPreview,
    ] = useState<string | null>(null);

    // Guarda la vista previa de la foto al editar
    const [
        editPhotoPreview,
        setEditPhotoPreview,
    ] = useState<string | null>(null);


    // Guarda lo escrito en el buscador
    const [
        searchTerm,
        setSearchTerm,
    ] = useState('');

    // Guarda el departamento utilizado como filtro
    const [
        departmentFilter,
        setDepartmentFilter,
    ] = useState('');

    // Página que se está mostrando
    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    // Máximo de usuarios por página
    const usersPerPage = 10;


    // Columna utilizada para ordenar
    const [
        sortField,
        setSortField,
    ] = useState<SortField>('name');

    // Guarda si el orden es ascendente o descendente
    const [
        sortDirection,
        setSortDirection,
    ] = useState<SortDirection>('asc');


    // Abre o cierra el recortador de fotografías
    const [
        showCropper,
        setShowCropper,
    ] = useState(false);

    // Guarda temporalmente la foto que se va a recortar
    const [
        cropSource,
        setCropSource,
    ] = useState<string | null>(null);

    // Guarda la posición de la fotografía
    const [
        crop,
        setCrop,
    ] = useState({
        x: 0,
        y: 0,
    });

    // Guarda el zoom utilizado
    const [
        zoom,
        setZoom,
    ] = useState(1);

    // Guarda el área seleccionada de la fotografía
    const [
        croppedAreaPixels,
        setCroppedAreaPixels,
    ] = useState<Area | null>(null);

    // Indica si la foto pertenece a registrar o editar
    const [
        photoMode,
        setPhotoMode,
    ] = useState<'create' | 'edit'>(
        'create'
    );


    // Formulario utilizado para editar usuario
    const {
        data,
        setData,
        post: postEdit,
        processing,
        errors,
        clearErrors,
        reset,
    } = useForm({

        _method: 'patch',

        first_name: '',
        last_name: '',
        email: '',

        company_id: '',
        department_id: '',

        // Aquí se guarda el puesto
        position: '',

        photo: null as File | null,
    });


    // Formulario utilizado para registrar usuario
    const createForm = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',

        company_id: '',
        department_id: '',

        // Aquí se guarda el puesto
        position: '',

        photo: null as File | null,
    });


    // Esta función abre el recortador al seleccionar una foto
    const handleCreatePhoto = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            e.target.files?.[0];

        if (!file) return;


        if (cropSource) {
            URL.revokeObjectURL(
                cropSource
            );
        }


        const imageUrl =
            URL.createObjectURL(file);


        setCropSource(
            imageUrl
        );

        setPhotoMode(
            'create'
        );

        setCrop({
            x: 0,
            y: 0,
        });

        setZoom(1);

        setCroppedAreaPixels(
            null
        );

        setShowCropper(
            true
        );


        // Permite volver a seleccionar el mismo archivo
        e.target.value = '';
    };


    // Esta función abre el recortador al cambiar una fotografía
    const handleEditPhoto = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            e.target.files?.[0];

        if (!file) return;


        if (cropSource) {
            URL.revokeObjectURL(
                cropSource
            );
        }


        const imageUrl =
            URL.createObjectURL(file);


        setCropSource(
            imageUrl
        );

        setPhotoMode(
            'edit'
        );

        setCrop({
            x: 0,
            y: 0,
        });

        setZoom(1);

        setCroppedAreaPixels(
            null
        );

        setShowCropper(
            true
        );


        e.target.value = '';
    };


    // Esta función guarda la parte seleccionada de la fotografía
    const onCropComplete = (
        _croppedArea: Area,
        croppedPixels: Area
    ) => {

        setCroppedAreaPixels(
            croppedPixels
        );
    };


    // Esta función genera la fotografía final después de recortarla
    const useCroppedPhoto =
        async () => {

            if (
                !cropSource ||
                !croppedAreaPixels
            ) {
                return;
            }


            try {

                const blob =
                    await getCroppedImage(
                        cropSource,
                        croppedAreaPixels
                    );


                const file =
                    new File(
                        [blob],
                        `perfil-${Date.now()}.jpg`,
                        {
                            type:
                                'image/jpeg',
                        }
                    );


                const preview =
                    URL.createObjectURL(
                        blob
                    );


                // Guarda la fotografía en el formulario de registro
                if (
                    photoMode ===
                    'create'
                ) {

                    if (
                        photoPreview
                    ) {
                        URL.revokeObjectURL(
                            photoPreview
                        );
                    }


                    createForm.setData(
                        'photo',
                        file
                    );


                    setPhotoPreview(
                        preview
                    );
                }


                // Guarda la fotografía en el formulario de edición
                if (
                    photoMode ===
                    'edit'
                ) {

                    if (
                        editPhotoPreview
                    ) {
                        URL.revokeObjectURL(
                            editPhotoPreview
                        );
                    }


                    setData(
                        'photo',
                        file
                    );


                    setEditPhotoPreview(
                        preview
                    );
                }


                URL.revokeObjectURL(
                    cropSource
                );


                setCropSource(null);

                setShowCropper(false);

                setZoom(1);

                setCroppedAreaPixels(
                    null
                );

            } catch (error) {

                console.error(
                    'Error al recortar la fotografía:',
                    error
                );
            }
        };


    // Esta función cierra el recortador sin utilizar la foto
    const cancelCrop = () => {

        if (cropSource) {

            URL.revokeObjectURL(
                cropSource
            );
        }


        setCropSource(null);

        setShowCropper(false);

        setZoom(1);

        setCroppedAreaPixels(
            null
        );
    };


    // Esta función limpia y cierra el formulario de registro
    const closeCreateUser = () => {

        setShowCreateUser(
            false
        );


        if (photoPreview) {

            URL.revokeObjectURL(
                photoPreview
            );
        }


        setPhotoPreview(
            null
        );


        createForm.reset();

        createForm.clearErrors();
    };


    // Esta función envía un usuario nuevo a Laravel
    const submitCreateUser = (
        e: FormEvent
    ) => {

        e.preventDefault();


        createForm.post(
            '/usuarios',
            {
                // FormData permite enviar la fotografía
                forceFormData: true,

                preserveScroll: true,

                onSuccess: () => {

                    closeCreateUser();
                },
            }
        );
    };


    // Esta función coloca los datos actuales dentro del formulario de edición
    const startEditing = () => {

        if (!selectedUser) {
            return;
        }


        clearErrors();


        if (
            editPhotoPreview
        ) {

            URL.revokeObjectURL(
                editPhotoPreview
            );
        }


        setEditPhotoPreview(
            null
        );


        setData({

            _method:
                'patch',

            first_name:
                selectedUser.first_name,

            last_name:
                selectedUser.last_name,

            email:
                selectedUser.email,

            company_id:
                String(
                    selectedUser
                        .company
                        .id
                ),

            department_id:
                String(
                    selectedUser
                        .department
                        .id
                ),

            // Muestra el puesto actual al editar
            position:
                selectedUser.position ??
                '',

            photo:
                null,
        });


        setIsEditing(
            true
        );
    };


    // Esta función cancela los cambios realizados
    const cancelEditing = () => {

        if (
            editPhotoPreview
        ) {

            URL.revokeObjectURL(
                editPhotoPreview
            );
        }


        setEditPhotoPreview(
            null
        );


        reset();

        clearErrors();

        setIsEditing(
            false
        );
    };


    // Esta función guarda los cambios realizados al usuario
    const submit = (
        e: FormEvent
    ) => {

        e.preventDefault();


        if (!selectedUser) {
            return;
        }


        postEdit(
            `/usuarios/${selectedUser.id}`,
            {
                // Permite enviar la fotografía junto con los demás datos
                forceFormData: true,

                preserveScroll: true,

                preserveState: false,

                onSuccess: () => {

                    if (
                        editPhotoPreview
                    ) {

                        URL.revokeObjectURL(
                            editPhotoPreview
                        );
                    }


                    setEditPhotoPreview(
                        null
                    );

                    setIsEditing(
                        false
                    );

                    setSelectedUser(
                        null
                    );
                },
            }
        );
    };


    // Esta función cierra la información del usuario
    const closeDialog = () => {

        if (
            editPhotoPreview
        ) {

            URL.revokeObjectURL(
                editPhotoPreview
            );
        }


        setEditPhotoPreview(
            null
        );

        setSelectedUser(
            null
        );

        setIsEditing(
            false
        );

        reset();

        clearErrors();
    };


    // Esta función abre la confirmación para eliminar
    const deleteUser = () => {

        if (!selectedUser) {
            return;
        }


        setShowDeleteConfirm(
            true
        );
    };


    // Esta función elimina definitivamente el usuario
    const confirmDelete = () => {

        if (!selectedUser) {
            return;
        }


        router.delete(
            `/usuarios/${selectedUser.id}`,
            {
                preserveScroll:
                    true,

                onSuccess: () => {

                    setShowDeleteConfirm(
                        false
                    );

                    setSelectedUser(
                        null
                    );

                    setIsEditing(
                        false
                    );
                },
            }
        );
    };


    // Esta función cambia el orden de una columna
    const handleSort = (
        field: SortField
    ) => {

        // Si se presiona la misma columna cambia ascendente por descendente
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

            // Una columna nueva comienza de forma ascendente
            setSortField(
                field
            );

            setSortDirection(
                'asc'
            );
        }


        setCurrentPage(
            1
        );
    };


    // Esta parte busca usuarios por varios datos
    const filteredUsers =
        users.filter(
            (user) => {

                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();


                const matchesSearch =

                    // Busca por nombre completo
                    `${user.first_name} ${user.last_name}`
                        .toLowerCase()
                        .includes(search)

                    ||

                    // Busca por correo
                    user.email
                        .toLowerCase()
                        .includes(search)

                    ||

                    // Busca por departamento
                    user.department.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    // También permite buscar utilizando el puesto
                    (
                        user.position ??
                        ''
                    )
                        .toLowerCase()
                        .includes(search);


                // Comprueba si se seleccionó un departamento
                const matchesDepartment =
                    departmentFilter ===
                        ''

                    ||

                    String(
                        user.department.id
                    ) ===
                        departmentFilter;


                return (
                    matchesSearch &&
                    matchesDepartment
                );
            }
        );


    // Esta parte ordena los usuarios antes de mostrarlos
    const sortedUsers =
        [...filteredUsers]
            .sort(
                (a, b) => {

                    let valueA =
                        '';

                    let valueB =
                        '';


                    if (
                        sortField ===
                        'name'
                    ) {

                        valueA =
                            `${a.first_name} ${a.last_name}`;

                        valueB =
                            `${b.first_name} ${b.last_name}`;
                    }


                    if (
                        sortField ===
                        'email'
                    ) {

                        valueA =
                            a.email;

                        valueB =
                            b.email;
                    }


                    if (
                        sortField ===
                        'department'
                    ) {

                        valueA =
                            a.department.name;

                        valueB =
                            b.department.name;
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


                    return (
                        sortDirection ===
                        'asc'
                            ? result
                            : -result
                    );
                }
            );


    // Calcula la cantidad total de páginas
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                sortedUsers.length /
                    usersPerPage
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


    // Calcula desde qué usuario inicia la página
    const startIndex =
        (currentPage - 1) *
        usersPerPage;


    // Obtiene únicamente los usuarios de la página actual
    const visibleUsers =
        sortedUsers.slice(
            startIndex,
            startIndex +
                usersPerPage
        );


    // Esta función muestra la fecha en formato de Guatemala
    const formatDate = (
        date: string
    ) => {

        return new Date(
            date
        ).toLocaleString(
            'es-GT',
            {
                dateStyle:
                    'medium',

                timeStyle:
                    'short',
            }
        );
    };


    return (
        <>

            {/* Ventana para mover, acercar y recortar la fotografía */}
            <Dialog
                open={
                    showCropper
                }

                onOpenChange={(open) => {

                    if (!open) {
                        cancelCrop();
                    }
                }}
            >

                <DialogContent className="sm:max-w-lg">

                    <DialogHeader>

                        <DialogTitle>
                            Ajustar fotografía
                        </DialogTitle>

                    </DialogHeader>


                    {/* Aquí se puede mover la fotografía con el mouse */}
                    <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black">

                        {cropSource && (

                            <Cropper
                                image={
                                    cropSource
                                }

                                crop={
                                    crop
                                }

                                zoom={
                                    zoom
                                }

                                aspect={
                                    1
                                }

                                cropShape="round"

                                showGrid={
                                    false
                                }

                                onCropChange={
                                    setCrop
                                }

                                onZoomChange={
                                    setZoom
                                }

                                onCropComplete={
                                    onCropComplete
                                }
                            />

                        )}

                    </div>


                    {/* Este control permite acercar o alejar la foto */}
                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Zoom
                        </label>


                        <input
                            type="range"

                            min={
                                1
                            }

                            max={
                                3
                            }

                            step={
                                0.1
                            }

                            value={
                                zoom
                            }

                            onChange={(e) =>
                                setZoom(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }

                            className="w-full"
                        />

                    </div>


                    <div className="flex justify-end gap-3 pt-3">

                        {/* Este botón cierra el recortador sin utilizar la foto */}
                        <button
                            type="button"

                            onClick={
                                cancelCrop
                            }

                            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                        >
                            Cancelar
                        </button>


                        {/* Este botón utiliza la parte seleccionada de la fotografía */}
                        <button
                            type="button"

                            onClick={
                                useCroppedPhoto
                            }

                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
                        >
                            Usar foto
                        </button>

                    </div>

                </DialogContent>

            </Dialog>


            <div className="flex min-h-screen bg-gray-50">

                <AppSidebar />


                <main className="min-w-0 flex-1 p-8">

                    <Head title="Personal" />


                    {/* Encabezado de la página */}
                    <div className="mb-6 flex items-center justify-between">

                        <div>

                            <h1 className="text-2xl font-bold text-gray-800">
                                Personal
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Personal registrado.
                            </p>

                        </div>


                        {/* Este botón abre el formulario para registrar un usuario */}
                        <button
                            type="button"

                            onClick={() =>
                                setShowCreateUser(
                                    true
                                )
                            }

                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            + Registrar usuario
                        </button>

                    </div>


                    {/* Buscador y filtro */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">

                        {/* Este campo permite buscar usuarios por nombre, correo, departamento o puesto */}
                        <input
                            type="text"

                            placeholder="Buscar por nombre, correo, departamento o puesto..."

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


                        {/* Este selector muestra solamente usuarios del departamento elegido */}
                        <select
                            value={
                                departmentFilter
                            }

                            onChange={(e) => {

                                setDepartmentFilter(
                                    e.target.value
                                );

                                setCurrentPage(
                                    1
                                );
                            }}

                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
                        >

                            <option value="">
                                Todos los departamentos
                            </option>


                            {departments.map(
                                (
                                    department
                                ) => (

                                    <option
                                        key={
                                            department.id
                                        }

                                        value={
                                            department.id
                                        }
                                    >
                                        {
                                            department.name
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Tabla de usuarios */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                        <div className="overflow-x-auto">

                            <Table>

                                <TableHeader>

                                    <TableRow className="bg-gray-50">

                                        <TableHead>

                                            {/* Este botón ordena la tabla utilizando el nombre */}
                                            <button
                                                type="button"

                                                onClick={() =>
                                                    handleSort(
                                                        'name'
                                                    )
                                                }

                                                className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                            >
                                                Nombre Completo

                                                {sortField ===
                                                    'name' && (

                                                    <span>
                                                        {sortDirection ===
                                                        'asc'
                                                            ? '↑'
                                                            : '↓'}
                                                    </span>

                                                )}

                                            </button>

                                        </TableHead>


                                        <TableHead>

                                            {/* Este botón ordena utilizando el correo */}
                                            <button
                                                type="button"

                                                onClick={() =>
                                                    handleSort(
                                                        'email'
                                                    )
                                                }

                                                className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                            >
                                                Correo Electrónico

                                                {sortField ===
                                                    'email' && (

                                                    <span>
                                                        {sortDirection ===
                                                        'asc'
                                                            ? '↑'
                                                            : '↓'}
                                                    </span>

                                                )}

                                            </button>

                                        </TableHead>


                                        <TableHead>

                                            {/* Este botón ordena utilizando el departamento */}
                                            <button
                                                type="button"

                                                onClick={() =>
                                                    handleSort(
                                                        'department'
                                                    )
                                                }

                                                className="flex items-center gap-2 font-semibold text-gray-600 hover:text-black"
                                            >
                                                Departamento

                                                {sortField ===
                                                    'department' && (

                                                    <span>
                                                        {sortDirection ===
                                                        'asc'
                                                            ? '↑'
                                                            : '↓'}
                                                    </span>

                                                )}

                                            </button>

                                        </TableHead>

                                    </TableRow>

                                </TableHeader>


                                <TableBody>

                                    {/* Este mensaje aparece cuando no hay resultados */}
                                    {visibleUsers.length ===
                                        0 && (

                                        <TableRow>

                                            <TableCell
                                                colSpan={
                                                    3
                                                }

                                                className="py-8 text-center text-gray-500"
                                            >
                                                No se encontraron usuarios.
                                            </TableCell>

                                        </TableRow>

                                    )}


                                    {visibleUsers.map(
                                        (
                                            user
                                        ) => (

                                        <TableRow
                                            key={
                                                user.id
                                            }

                                            onClick={() => {

                                                setSelectedUser(
                                                    user
                                                );

                                                setIsEditing(
                                                    false
                                                );
                                            }}

                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                        >

                                            <TableCell className="font-medium text-gray-900">

                                                <div className="flex items-center gap-3">

                                                    {user.photo_path ? (

                                                        <img
                                                            src={`/usuarios/${user.id}/foto?v=${encodeURIComponent(
                                                                user.updated_at
                                                            )}`}

                                                            alt={`${user.first_name} ${user.last_name}`}

                                                            className="h-10 w-10 rounded-full border object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">

                                                            {
                                                                user.first_name.charAt(
                                                                    0
                                                                )
                                                            }

                                                            {
                                                                user.last_name.charAt(
                                                                    0
                                                                )
                                                            }

                                                        </div>

                                                    )}


                                                    <span>

                                                        {
                                                            user.first_name
                                                        }{' '}

                                                        {
                                                            user.last_name
                                                        }

                                                    </span>

                                                </div>

                                            </TableCell>


                                            <TableCell className="text-gray-500">

                                                {
                                                    user.email
                                                }

                                            </TableCell>


                                            <TableCell>

                                                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">

                                                    {
                                                        user.department.name
                                                    }

                                                </span>

                                            </TableCell>

                                        </TableRow>

                                    ))}

                                </TableBody>

                            </Table>

                        </div>

                    </div>


                    {/* Esta parte permite cambiar entre páginas */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-sm text-gray-500">

                            Mostrando{' '}

                            {filteredUsers.length ===
                            0
                                ? 0
                                : startIndex +
                                  1}

                            {' - '}

                            {Math.min(
                                startIndex +
                                    usersPerPage,

                                filteredUsers.length
                            )}

                            {' de '}

                            {
                                filteredUsers.length
                            }

                            {' usuarios'}

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
                                        (
                                            page
                                        ) =>
                                            Math.max(
                                                page -
                                                    1,
                                                1
                                            )
                                    )
                                }

                                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Anterior
                            </button>


                            <span className="px-2 text-sm text-gray-600">

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
                                        (
                                            page
                                        ) =>
                                            Math.min(
                                                page +
                                                    1,

                                                totalPages
                                            )
                                    )
                                }

                                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Siguiente
                            </button>

                        </div>

                    </div>


                    {/* Ventana para registrar un usuario */}
                    <Dialog
                        open={
                            showCreateUser
                        }

                        onOpenChange={(open) => {

                            if (!open) {
                                closeCreateUser();
                            }
                        }}
                    >

                        <DialogContent className="max-h-[90vh] overflow-y-auto p-8 sm:max-w-2xl">

                            <DialogHeader>

                                <DialogTitle className="text-xl">
                                    Registrar usuario
                                </DialogTitle>

                            </DialogHeader>


                            <form
                                onSubmit={
                                    submitCreateUser
                                }

                                className="space-y-5"
                            >

                                {/* Fotografía */}
                                <div className="flex flex-col items-center">

                                    {/* Este botón permite seleccionar una fotografía */}
                                    <label
                                        htmlFor="create-photo"

                                        className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition hover:border-gray-500"
                                    >

                                        {photoPreview ? (

                                            <>

                                                <img
                                                    src={
                                                        photoPreview
                                                    }

                                                    alt="Vista previa"

                                                    className="h-full w-full object-cover"
                                                />


                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">

                                                    <span className="text-sm font-medium text-white">
                                                        Cambiar foto
                                                    </span>

                                                </div>

                                            </>

                                        ) : (

                                            <span className="px-4 text-center text-sm text-gray-500">
                                                Agregar foto
                                            </span>

                                        )}

                                    </label>


                                    <input
                                        id="create-photo"

                                        type="file"

                                        accept="image/jpeg,image/png,image/webp"

                                        capture="user"

                                        onChange={
                                            handleCreatePhoto
                                        }

                                        className="hidden"
                                    />


                                    <p className="mt-2 text-xs text-gray-500">
                                        Haz clic en la foto para seleccionar o tomar una imagen
                                    </p>


                                    {createForm.errors.photo && (

                                        <p className="mt-1 text-sm text-red-500">
                                            {
                                                createForm.errors.photo
                                            }
                                        </p>

                                    )}

                                </div>


                                {/* Nombre y apellido */}
                                <div className="grid gap-4 sm:grid-cols-2">

                                    <div>

                                        <label className="text-sm font-medium">
                                            Nombre
                                        </label>


                                        <input
                                            type="text"

                                            value={
                                                createForm.data.first_name
                                            }

                                            onChange={(e) =>
                                                createForm.setData(
                                                    'first_name',
                                                    e.target.value
                                                )
                                            }

                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        />


                                        {createForm.errors.first_name && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {
                                                    createForm.errors.first_name
                                                }

                                            </p>

                                        )}

                                    </div>


                                    <div>

                                        <label className="text-sm font-medium">
                                            Apellido
                                        </label>


                                        <input
                                            type="text"

                                            value={
                                                createForm.data.last_name
                                            }

                                            onChange={(e) =>
                                                createForm.setData(
                                                    'last_name',
                                                    e.target.value
                                                )
                                            }

                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        />


                                        {createForm.errors.last_name && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {
                                                    createForm.errors.last_name
                                                }

                                            </p>

                                        )}

                                    </div>

                                </div>


                                {/* Correo */}
                                <div>

                                    <label className="text-sm font-medium">
                                        Correo electrónico
                                    </label>


                                    <input
                                        type="email"

                                        value={
                                            createForm.data.email
                                        }

                                        onChange={(e) =>
                                            createForm.setData(
                                                'email',
                                                e.target.value
                                            )
                                        }

                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />


                                    {createForm.errors.email && (

                                        <p className="mt-1 text-sm text-red-500">

                                            {
                                                createForm.errors.email
                                            }

                                        </p>

                                    )}

                                </div>


                                {/* Contraseña */}
                                <div>

                                    <label className="text-sm font-medium">
                                        Contraseña
                                    </label>


                                    <input
                                        type="password"

                                        value={
                                            createForm.data.password
                                        }

                                        onChange={(e) =>
                                            createForm.setData(
                                                'password',
                                                e.target.value
                                            )
                                        }

                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />


                                    {createForm.errors.password && (

                                        <p className="mt-1 text-sm text-red-500">

                                            {
                                                createForm.errors.password
                                            }

                                        </p>

                                    )}

                                </div>


                                {/* Empresa y departamento */}
                                <div className="grid gap-4 sm:grid-cols-2">

                                    <div>

                                        <label className="text-sm font-medium">
                                            Empresa
                                        </label>


                                        <select
                                            value={
                                                createForm.data.company_id
                                            }

                                            onChange={(e) =>
                                                createForm.setData(
                                                    'company_id',
                                                    e.target.value
                                                )
                                            }

                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        >

                                            <option value="">
                                                Selecciona una empresa
                                            </option>


                                            {companies.map(
                                                (
                                                    company
                                                ) => (

                                                <option
                                                    key={
                                                        company.id
                                                    }

                                                    value={
                                                        company.id
                                                    }
                                                >
                                                    {
                                                        company.name
                                                    }
                                                </option>

                                            ))}

                                        </select>


                                        {createForm.errors.company_id && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {
                                                    createForm.errors.company_id
                                                }

                                            </p>

                                        )}

                                    </div>


                                    <div>

                                        <label className="text-sm font-medium">
                                            Departamento
                                        </label>


                                        <select
                                            value={
                                                createForm.data.department_id
                                            }

                                            onChange={(e) =>
                                                createForm.setData(
                                                    'department_id',
                                                    e.target.value
                                                )
                                            }

                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        >

                                            <option value="">
                                                Selecciona un departamento
                                            </option>


                                            {departments.map(
                                                (
                                                    department
                                                ) => (

                                                <option
                                                    key={
                                                        department.id
                                                    }

                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </option>

                                            ))}

                                        </select>


                                        {createForm.errors.department_id && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {
                                                    createForm.errors.department_id
                                                }

                                            </p>

                                        )}

                                    </div>

                                </div>


                                {/* Este campo permite indicar el puesto del usuario */}
                                <div>

                                    <label className="text-sm font-medium">
                                        Puesto
                                    </label>


                                    <input
                                        type="text"

                                        placeholder="Ej. Técnico de Soporte"

                                        value={
                                            createForm.data.position
                                        }

                                        onChange={(e) =>
                                            createForm.setData(
                                                'position',
                                                e.target.value
                                            )
                                        }

                                        className="mt-1 w-full rounded-md border px-3 py-2"
                                    />


                                    {createForm.errors.position && (

                                        <p className="mt-1 text-sm text-red-500">

                                            {
                                                createForm.errors.position
                                            }

                                        </p>

                                    )}

                                </div>


                                <div className="flex justify-end gap-3 border-t pt-5">

                                    {/* Este botón cierra el formulario sin registrar */}
                                    <button
                                        type="button"

                                        onClick={
                                            closeCreateUser
                                        }

                                        className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>


                                    {/* Este botón registra el nuevo usuario */}
                                    <button
                                        type="submit"

                                        disabled={
                                            createForm.processing
                                        }

                                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                                    >

                                        {createForm.processing
                                            ? 'Registrando...'
                                            : 'Registrar usuario'}

                                    </button>

                                </div>

                            </form>

                        </DialogContent>

                    </Dialog>


                    {/* Ventana para consultar o editar un usuario */}
                    <Dialog
                        open={
                            selectedUser !==
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

                        <DialogContent className="max-h-[90vh] overflow-y-auto p-8 sm:max-w-2xl">

                            <DialogHeader>

                                <DialogTitle className="text-xl">

                                    {isEditing
                                        ? 'Editar usuario'
                                        : 'Información del usuario'}

                                </DialogTitle>

                            </DialogHeader>


                            {/* Información del usuario */}
                            {selectedUser &&
                                !isEditing && (

                                <div className="space-y-6">

                                    {/* Fotografía */}
                                    <div className="flex justify-center">

                                        {selectedUser.photo_path ? (

                                            <img
                                                src={`/usuarios/${selectedUser.id}/foto?v=${encodeURIComponent(
                                                    selectedUser.updated_at
                                                )}`}

                                                alt={`${selectedUser.first_name} ${selectedUser.last_name}`}

                                                className="h-28 w-28 rounded-full border object-cover shadow-sm"
                                            />

                                        ) : (

                                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-500">

                                                {
                                                    selectedUser.first_name.charAt(
                                                        0
                                                    )
                                                }

                                                {
                                                    selectedUser.last_name.charAt(
                                                        0
                                                    )
                                                }

                                            </div>

                                        )}

                                    </div>


                                    {/* Datos del usuario */}
                                    <div className="grid gap-5 sm:grid-cols-2">

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Nombre
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {
                                                    selectedUser.first_name
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Apellido
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {
                                                    selectedUser.last_name
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Correo electrónico
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {
                                                    selectedUser.email
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Empresa
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {
                                                    selectedUser.company.name
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Departamento
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">
                                                {
                                                    selectedUser.department.name
                                                }
                                            </p>

                                        </div>


                                        {/* Aquí aparece el puesto del usuario */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Puesto
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">

                                                {
                                                    selectedUser.position ??
                                                    'Sin puesto asignado'
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Creado el
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">

                                                {
                                                    formatDate(
                                                        selectedUser.created_at
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Última actualización
                                            </p>

                                            <p className="mt-1 font-medium text-gray-900">

                                                {
                                                    formatDate(
                                                        selectedUser.updated_at
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
                                                deleteUser
                                            }

                                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                                        >
                                            Eliminar
                                        </button>


                                        {/* Este botón permite modificar la información */}
                                        <button
                                            type="button"

                                            onClick={
                                                startEditing
                                            }

                                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                        >
                                            Editar
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* Formulario para editar usuario */}
                            {selectedUser &&
                                isEditing && (

                                <form
                                    onSubmit={
                                        submit
                                    }

                                    className="space-y-5"
                                >

                                    {/* Este campo permite cambiar la fotografía */}
                                    <div className="flex flex-col items-center">

                                        <label
                                            htmlFor="edit-photo"

                                            className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm"
                                        >

                                            {editPhotoPreview ||
                                            selectedUser.photo_path ? (

                                                <>

                                                    <img
                                                        src={
                                                            editPhotoPreview ??
                                                            `/usuarios/${selectedUser.id}/foto?v=${encodeURIComponent(
                                                                selectedUser.updated_at
                                                            )}`
                                                        }

                                                        alt={`${selectedUser.first_name} ${selectedUser.last_name}`}

                                                        className="h-full w-full object-cover"
                                                    />


                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">

                                                        <span className="text-sm font-medium text-white">
                                                            Cambiar foto
                                                        </span>

                                                    </div>

                                                </>

                                            ) : (

                                                <>

                                                    <span className="text-2xl font-semibold text-gray-500">

                                                        {
                                                            selectedUser.first_name.charAt(
                                                                0
                                                            )
                                                        }

                                                        {
                                                            selectedUser.last_name.charAt(
                                                                0
                                                            )
                                                        }

                                                    </span>

                                                </>

                                            )}

                                        </label>


                                        <input
                                            id="edit-photo"

                                            type="file"

                                            accept="image/jpeg,image/png,image/webp"

                                            capture="user"

                                            onChange={
                                                handleEditPhoto
                                            }

                                            className="hidden"
                                        />


                                        <label
                                            htmlFor="edit-photo"

                                            className="mt-2 cursor-pointer text-sm text-gray-500 hover:text-gray-900"
                                        >

                                            {editPhotoPreview ||
                                            selectedUser.photo_path
                                                ? 'Cambiar foto'
                                                : 'Agregar foto'}

                                        </label>


                                        {errors.photo && (

                                            <p className="mt-1 text-sm text-red-500">
                                                {
                                                    errors.photo
                                                }
                                            </p>

                                        )}

                                    </div>


                                    {/* Nombre y apellido */}
                                    <div className="grid gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className="text-sm font-medium">
                                                Nombre
                                            </label>


                                            <input
                                                type="text"

                                                value={
                                                    data.first_name
                                                }

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
                                                    {
                                                        errors.first_name
                                                    }
                                                </p>

                                            )}

                                        </div>


                                        <div>

                                            <label className="text-sm font-medium">
                                                Apellido
                                            </label>


                                            <input
                                                type="text"

                                                value={
                                                    data.last_name
                                                }

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
                                                    {
                                                        errors.last_name
                                                    }
                                                </p>

                                            )}

                                        </div>

                                    </div>


                                    {/* Correo */}
                                    <div>

                                        <label className="text-sm font-medium">
                                            Correo electrónico
                                        </label>


                                        <input
                                            type="email"

                                            value={
                                                data.email
                                            }

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
                                                {
                                                    errors.email
                                                }
                                            </p>

                                        )}

                                    </div>


                                    {/* Empresa y departamento */}
                                    <div className="grid gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className="text-sm font-medium">
                                                Empresa
                                            </label>


                                            <select
                                                value={
                                                    data.company_id
                                                }

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


                                                {companies.map(
                                                    (
                                                        company
                                                    ) => (

                                                    <option
                                                        key={
                                                            company.id
                                                        }

                                                        value={
                                                            company.id
                                                        }
                                                    >
                                                        {
                                                            company.name
                                                        }
                                                    </option>

                                                ))}

                                            </select>


                                            {errors.company_id && (

                                                <p className="mt-1 text-sm text-red-500">
                                                    {
                                                        errors.company_id
                                                    }
                                                </p>

                                            )}

                                        </div>


                                        <div>

                                            <label className="text-sm font-medium">
                                                Departamento
                                            </label>


                                            <select
                                                value={
                                                    data.department_id
                                                }

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


                                                {departments.map(
                                                    (
                                                        department
                                                    ) => (

                                                    <option
                                                        key={
                                                            department.id
                                                        }

                                                        value={
                                                            department.id
                                                        }
                                                    >
                                                        {
                                                            department.name
                                                        }
                                                    </option>

                                                ))}

                                            </select>


                                            {errors.department_id && (

                                                <p className="mt-1 text-sm text-red-500">
                                                    {
                                                        errors.department_id
                                                    }
                                                </p>

                                            )}

                                        </div>

                                    </div>


                                    {/* Este campo permite modificar el puesto */}
                                    <div>

                                        <label className="text-sm font-medium">
                                            Puesto
                                        </label>


                                        <input
                                            type="text"

                                            placeholder="Ej. Técnico de Soporte"

                                            value={
                                                data.position
                                            }

                                            onChange={(e) =>
                                                setData(
                                                    'position',
                                                    e.target.value
                                                )
                                            }

                                            className="mt-1 w-full rounded-md border px-3 py-2"
                                        />


                                        {errors.position && (

                                            <p className="mt-1 text-sm text-red-500">
                                                {
                                                    errors.position
                                                }
                                            </p>

                                        )}

                                    </div>


                                    <div className="flex justify-end gap-3 border-t pt-5">

                                        {/* Este botón cancela los cambios */}
                                        <button
                                            type="button"

                                            onClick={
                                                cancelEditing
                                            }

                                            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>


                                        {/* Este botón guarda los cambios */}
                                        <button
                                            type="submit"

                                            disabled={
                                                processing
                                            }

                                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
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


                    {/* Confirmación antes de eliminar usuario */}
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
                                    ¿Eliminar usuario?
                                </AlertDialogTitle>


                                <AlertDialogDescription>

                                    {selectedUser && (

                                        <>

                                            ¿Seguro que deseas eliminar a{' '}

                                            <strong className="text-gray-900">

                                                {
                                                    selectedUser.first_name
                                                }{' '}

                                                {
                                                    selectedUser.last_name
                                                }

                                            </strong>

                                            ? Esta acción no se puede deshacer.

                                        </>

                                    )}

                                </AlertDialogDescription>

                            </AlertDialogHeader>


                            <AlertDialogFooter>

                                {/* Este botón cancela la eliminación */}
                                <AlertDialogCancel>
                                    Cancelar
                                </AlertDialogCancel>


                                {/* Este botón elimina definitivamente el usuario */}
                                <AlertDialogAction
                                    onClick={
                                        confirmDelete
                                    }

                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Sí, eliminar
                                </AlertDialogAction>

                            </AlertDialogFooter>

                        </AlertDialogContent>

                    </AlertDialog>

                </main>

            </div>

        </>
    );
}
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


// Define la estructura de una empresa
interface Company {
    id: number;
    name: string;
}


// Define la estructura de un departamento
interface Department {
    id: number;
    name: string;
}


// Define la estructura de un usuario
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


// Datos enviados desde Laravel a esta página
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

    // =====================================================
    // ESTADOS DE LOS MODALES
    // =====================================================

    // Guarda el usuario que se selecciona en la tabla
    const [selectedUser, setSelectedUser] =
        useState<User | null>(null);

    // Indica si el modal está en modo edición
    const [isEditing, setIsEditing] =
        useState(false);

    // Controla la ventana para confirmar eliminación
    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false);

    // Controla la ventana para registrar usuarios
    const [showCreateUser, setShowCreateUser] =
        useState(false);



    // =====================================================
    // VISTAS PREVIAS DE FOTOGRAFÍAS
    // =====================================================

    // Foto seleccionada al registrar un usuario
    const [photoPreview, setPhotoPreview] =
        useState<string | null>(null);

    // Foto nueva seleccionada al editar un usuario
    const [editPhotoPreview, setEditPhotoPreview] =
        useState<string | null>(null);



    // =====================================================
    // BÚSQUEDA Y PAGINACIÓN
    // =====================================================

    // Texto escrito en el buscador
    const [searchTerm, setSearchTerm] =
        useState('');

    // Departamento seleccionado en el filtro
    const [departmentFilter, setDepartmentFilter] =
        useState('');

    // Página actual
    const [currentPage, setCurrentPage] =
        useState(1);

    // Cantidad máxima de usuarios por página
    const usersPerPage = 10;



    // =====================================================
    // ESTADOS DEL RECORTADOR DE FOTOGRAFÍAS
    // =====================================================

    // Abre o cierra el recortador
    const [showCropper, setShowCropper] =
        useState(false);

    // Imagen original que se va a recortar
    const [cropSource, setCropSource] =
        useState<string | null>(null);

    // Posición X/Y de la fotografía
    const [crop, setCrop] = useState({
        x: 0,
        y: 0,
    });

    // Nivel de zoom
    const [zoom, setZoom] =
        useState(1);

    // Área exacta seleccionada por react-easy-crop
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Area | null>(null);

    // Indica si la foto pertenece a crear o editar
    const [photoMode, setPhotoMode] =
        useState<'create' | 'edit'>('create');



    // =====================================================
    // FORMULARIO PARA EDITAR USUARIO
    // =====================================================

    const {
        data,
        setData,
        post: postEdit,
        processing,
        errors,
        clearErrors,
        reset,
    } = useForm({
        // Laravel interpretará este POST como PATCH
        _method: 'patch',

        first_name: '',
        last_name: '',
        email: '',
        company_id: '',
        department_id: '',

        // Archivo nuevo de fotografía
        photo: null as File | null,
    });



    // =====================================================
    // FORMULARIO PARA REGISTRAR USUARIO
    // =====================================================

    const createForm = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        company_id: '',
        department_id: '',

        // Fotografía que se enviará a Laravel
        photo: null as File | null,
    });



    // =====================================================
    // SELECCIONAR FOTO AL REGISTRAR
    // =====================================================

    const handleCreatePhoto = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        // Obtiene la fotografía seleccionada
        const file = e.target.files?.[0];

        // Si no hay archivo no continúa
        if (!file) return;


        // Libera una fotografía anterior del recortador
        if (cropSource) {
            URL.revokeObjectURL(cropSource);
        }


        // Crea una dirección temporal para visualizarla
        const imageUrl =
            URL.createObjectURL(file);


        // Guarda la imagen en el recortador
        setCropSource(imageUrl);

        // Indica que estamos registrando
        setPhotoMode('create');


        // Reinicia posición
        setCrop({
            x: 0,
            y: 0,
        });

        // Reinicia zoom
        setZoom(1);

        // Limpia el recorte anterior
        setCroppedAreaPixels(null);

        // Abre la ventana del recortador
        setShowCropper(true);


        // Permite seleccionar nuevamente
        // el mismo archivo si se desea
        e.target.value = '';
    };



    // =====================================================
    // SELECCIONAR FOTO AL EDITAR
    // =====================================================

    const handleEditPhoto = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        // Obtiene el archivo seleccionado
        const file = e.target.files?.[0];

        if (!file) return;


        // Elimina una URL temporal anterior
        if (cropSource) {
            URL.revokeObjectURL(cropSource);
        }


        // Crea la vista temporal
        const imageUrl =
            URL.createObjectURL(file);


        // Envía la imagen al recortador
        setCropSource(imageUrl);

        // Indica que estamos editando
        setPhotoMode('edit');


        // Reinicia posición y zoom
        setCrop({
            x: 0,
            y: 0,
        });

        setZoom(1);

        setCroppedAreaPixels(null);

        // Abre el recortador
        setShowCropper(true);


        // Permite seleccionar nuevamente
        // el mismo archivo
        e.target.value = '';
    };



    // =====================================================
    // OBTENER ÁREA SELECCIONADA DEL RECORTADOR
    // =====================================================

    const onCropComplete = (
        _croppedArea: Area,
        croppedPixels: Area
    ) => {

        // Guarda las coordenadas exactas
        // que posteriormente recortaremos
        setCroppedAreaPixels(croppedPixels);
    };



    // =====================================================
    // USAR FOTOGRAFÍA RECORTADA
    // =====================================================

    const useCroppedPhoto = async () => {

        // Deben existir imagen y coordenadas
        if (!cropSource || !croppedAreaPixels) {
            return;
        }


        try {

            // Genera un Blob solamente con
            // la parte seleccionada
            const blob =
                await getCroppedImage(
                    cropSource,
                    croppedAreaPixels
                );


            // Convierte el Blob en un archivo JPG
            const file = new File(
                [blob],
                `perfil-${Date.now()}.jpg`,
                {
                    type: 'image/jpeg',
                }
            );


            // Dirección temporal para la vista previa
            const preview =
                URL.createObjectURL(blob);



            // Si estamos registrando un usuario
            if (photoMode === 'create') {

                // Libera una vista previa anterior
                if (photoPreview) {
                    URL.revokeObjectURL(
                        photoPreview
                    );
                }

                // Guarda la foto dentro del formulario
                createForm.setData(
                    'photo',
                    file
                );

                // Muestra la vista previa
                setPhotoPreview(preview);
            }



            // Si estamos editando un usuario
            if (photoMode === 'edit') {

                // Libera la vista anterior
                if (editPhotoPreview) {
                    URL.revokeObjectURL(
                        editPhotoPreview
                    );
                }

                // Guarda la fotografía en el formulario
                setData(
                    'photo',
                    file
                );

                // Muestra la nueva fotografía
                setEditPhotoPreview(preview);
            }


            // Libera la imagen original
            URL.revokeObjectURL(cropSource);

            // Cierra y limpia el recortador
            setCropSource(null);
            setShowCropper(false);
            setZoom(1);
            setCroppedAreaPixels(null);

        } catch (error) {

            // Si ocurre un error aparece en consola
            console.error(
                'Error al recortar la fotografía:',
                error
            );
        }
    };



    // =====================================================
    // CANCELAR RECORTE
    // =====================================================

    const cancelCrop = () => {

        // Libera la imagen temporal
        if (cropSource) {
            URL.revokeObjectURL(cropSource);
        }

        // Limpia todos los datos del recortador
        setCropSource(null);
        setShowCropper(false);
        setZoom(1);
        setCroppedAreaPixels(null);
    };



    // =====================================================
    // CERRAR FORMULARIO DE REGISTRO
    // =====================================================

    const closeCreateUser = () => {

        // Cierra el modal
        setShowCreateUser(false);


        // Libera la vista previa
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }


        // Limpia fotografía y formulario
        setPhotoPreview(null);

        createForm.reset();
        createForm.clearErrors();
    };



    // =====================================================
    // REGISTRAR USUARIO
    // =====================================================

    const submitCreateUser = (
        e: FormEvent
    ) => {

        // Evita recargar la página completa
        e.preventDefault();


        // Envía los datos a Laravel
        createForm.post('/usuarios', {

            // Necesario porque enviamos archivos
            forceFormData: true,

            // Mantiene la posición de la pantalla
            preserveScroll: true,


            // Si Laravel guarda correctamente
            onSuccess: () => {

                // Limpia y cierra el formulario
                closeCreateUser();
            },
        });
    };



    // =====================================================
    // ABRIR MODO EDICIÓN
    // =====================================================

    const startEditing = () => {

        // Debe existir un usuario seleccionado
        if (!selectedUser) return;


        // Limpia errores anteriores
        clearErrors();


        // Elimina una vista previa anterior
        if (editPhotoPreview) {
            URL.revokeObjectURL(
                editPhotoPreview
            );
        }


        setEditPhotoPreview(null);


        // Coloca los datos actuales
        // dentro del formulario de edición
        setData({
            _method: 'patch',

            first_name:
                selectedUser.first_name,

            last_name:
                selectedUser.last_name,

            email:
                selectedUser.email,

            company_id:
                String(selectedUser.company.id),

            department_id:
                String(selectedUser.department.id),

            photo: null,
        });


        // Cambia el modal a modo edición
        setIsEditing(true);
    };



    // =====================================================
    // CANCELAR EDICIÓN
    // =====================================================

    const cancelEditing = () => {

        // Si se seleccionó otra fotografía,
        // elimina solamente la vista previa
        if (editPhotoPreview) {
            URL.revokeObjectURL(
                editPhotoPreview
            );
        }


        setEditPhotoPreview(null);

        // Limpia formulario y errores
        reset();
        clearErrors();

        // Regresa al modo información
        setIsEditing(false);
    };



    // =====================================================
    // GUARDAR CAMBIOS DEL USUARIO
    // =====================================================

    const submit = (
        e: FormEvent
    ) => {

        e.preventDefault();


        if (!selectedUser) return;


        // Se usa POST con _method PATCH
        // porque estamos enviando una fotografía
        postEdit(
            `/usuarios/${selectedUser.id}`,
            {

                forceFormData: true,

                preserveScroll: true,

                // Recarga los nuevos datos
                preserveState: false,


                onSuccess: () => {

                    // Libera vista previa
                    if (editPhotoPreview) {
                        URL.revokeObjectURL(
                            editPhotoPreview
                        );
                    }


                    setEditPhotoPreview(null);

                    // Cierra edición
                    setIsEditing(false);
                    setSelectedUser(null);
                },
            }
        );
    };



    // =====================================================
    // CERRAR MODAL DEL USUARIO
    // =====================================================

    const closeDialog = () => {

        // Libera una fotografía temporal
        if (editPhotoPreview) {
            URL.revokeObjectURL(
                editPhotoPreview
            );
        }


        setEditPhotoPreview(null);

        // Quita usuario seleccionado
        setSelectedUser(null);

        // Sale del modo edición
        setIsEditing(false);

        // Limpia formulario
        reset();
        clearErrors();
    };



    // =====================================================
    // ABRIR CONFIRMACIÓN DE ELIMINAR
    // =====================================================

    const deleteUser = () => {

        if (!selectedUser) return;

        // Abre AlertDialog
        setShowDeleteConfirm(true);
    };



    // =====================================================
    // ELIMINAR USUARIO
    // =====================================================

    const confirmDelete = () => {

        if (!selectedUser) return;


        // Envía DELETE a Laravel
        router.delete(
            `/usuarios/${selectedUser.id}`,
            {

                preserveScroll: true,


                onSuccess: () => {

                    // Cierra todos los modales
                    setShowDeleteConfirm(false);

                    setSelectedUser(null);

                    setIsEditing(false);
                },
            }
        );
    };



    // =====================================================
    // FILTRAR USUARIOS
    // =====================================================

    const filteredUsers = users.filter(
        (user) => {

            // Convierte búsqueda a minúsculas
            // para ignorar mayúsculas/minúsculas
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            // Busca por nombre completo,
            // correo o departamento
            const matchesSearch =
                `${user.first_name} ${user.last_name}`
                    .toLowerCase()
                    .includes(search) ||

                user.email
                    .toLowerCase()
                    .includes(search) ||

                user.department.name
                    .toLowerCase()
                    .includes(search);


            // Comprueba el departamento seleccionado
            const matchesDepartment =
                departmentFilter === '' ||

                String(user.department.id) ===
                    departmentFilter;


            // Solo muestra usuarios
            // que cumplan ambos filtros
            return (
                matchesSearch &&
                matchesDepartment
            );
        }
    );



    // =====================================================
    // PAGINACIÓN
    // =====================================================

    // Calcula cuántas páginas existen
    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredUsers.length /
                usersPerPage
        )
    );


    // Si después de eliminar un usuario
    // la página actual ya no existe,
    // regresa a la última disponible
    useEffect(() => {

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }

    }, [currentPage, totalPages]);


    // Posición desde donde inicia la página
    const startIndex =
        (currentPage - 1) *
        usersPerPage;


    // Obtiene únicamente los 10 usuarios
    // correspondientes a la página actual
    const visibleUsers =
        filteredUsers.slice(
            startIndex,
            startIndex + usersPerPage
        );



    // =====================================================
    // FORMATEAR FECHA
    // =====================================================

    const formatDate = (
        date: string
    ) => {

        // Convierte la fecha al formato de Guatemala
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



    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <>

            {/* ============================================= */}
            {/* MODAL PARA AJUSTAR LA FOTOGRAFÍA */}
            {/* ============================================= */}

            <Dialog
                open={showCropper}
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


                    {/* Área donde se mueve la imagen */}
                    <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black">

                        {cropSource && (

                            <Cropper
                                image={cropSource}

                                // Posición de la fotografía
                                crop={crop}

                                // Nivel de acercamiento
                                zoom={zoom}

                                // Siempre genera una foto 1:1
                                aspect={1}

                                // Muestra visualmente un círculo
                                cropShape="round"

                                showGrid={false}

                                // Guarda la nueva posición
                                onCropChange={
                                    setCrop
                                }

                                // Guarda el nuevo zoom
                                onZoomChange={
                                    setZoom
                                }

                                // Obtiene las coordenadas finales
                                onCropComplete={
                                    onCropComplete
                                }
                            />

                        )}

                    </div>


                    {/* Control para acercar o alejar */}
                    <div className="space-y-2">

                        <label className="text-sm font-medium">
                            Zoom
                        </label>


                        <input
                            type="range"

                            min={1}
                            max={3}
                            step={0.1}

                            value={zoom}

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


                    {/* Botones del recortador */}
                    <div className="flex justify-end gap-3 pt-3">

                        <button
                            type="button"

                            onClick={
                                cancelCrop
                            }

                            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                        >
                            Cancelar
                        </button>


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



            {/* ============================================= */}
            {/* PÁGINA PRINCIPAL */}
            {/* ============================================= */}

            <div className="flex min-h-screen bg-gray-50">

                {/* Menú lateral */}
                <AppSidebar />


                {/* Contenido principal */}
                <main className="min-w-0 flex-1 p-8">

                    <Head title="Personal" />



                    {/* ===================================== */}
                    {/* ENCABEZADO */}
                    {/* ===================================== */}

                    <div className="mb-6 flex items-center justify-between">

                        <div>

                            <h1 className="text-2xl font-bold text-gray-800">
                                Personal
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Personal registrado.
                            </p>

                        </div>


                        {/* Abre el modal para registrar */}
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



                    {/* ===================================== */}
                    {/* BUSCADOR Y FILTRO */}
                    {/* ===================================== */}

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">

                        {/* Busca por nombre, correo o departamento */}
                        <input
                            type="text"

                            placeholder="Buscar por nombre, correo o departamento..."

                            value={searchTerm}

                            onChange={(e) => {

                                setSearchTerm(
                                    e.target.value
                                );

                                // Cada nueva búsqueda
                                // vuelve a la página 1
                                setCurrentPage(1);
                            }}

                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-500 sm:max-w-md"
                        />


                        {/* Filtra usuarios por departamento */}
                        <select
                            value={
                                departmentFilter
                            }

                            onChange={(e) => {

                                setDepartmentFilter(
                                    e.target.value
                                );

                                setCurrentPage(1);
                            }}

                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
                        >

                            <option value="">
                                Todos los departamentos
                            </option>


                            {departments.map(
                                (department) => (

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



                    {/* ===================================== */}
                    {/* TABLA DE USUARIOS */}
                    {/* ===================================== */}

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


                                    {/* Si no se encuentra ningún usuario */}
                                    {visibleUsers.length === 0 && (

                                        <TableRow>

                                            <TableCell
                                                colSpan={3}
                                                className="py-8 text-center text-gray-500"
                                            >
                                                No se encontraron usuarios.
                                            </TableCell>

                                        </TableRow>

                                    )}



                                    {/* Recorre solamente los usuarios visibles */}
                                    {visibleUsers.map(
                                        (user) => (

                                            <TableRow
                                                key={user.id}

                                                // Abre información del usuario
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


                                                {/* Foto y nombre */}
                                                <TableCell className="font-medium text-gray-900">

                                                    <div className="flex items-center gap-3">


                                                        {/* Si tiene foto */}
                                                        {user.photo_path ? (

                                                            <img
                                                                src={`/usuarios/${user.id}/foto?v=${encodeURIComponent(
                                                                    user.updated_at
                                                                )}`}

                                                                alt={`${user.first_name} ${user.last_name}`}

                                                                className="h-10 w-10 rounded-full border object-cover"
                                                            />

                                                        ) : (

                                                            // Si no tiene foto muestra iniciales
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
                                                            {user.first_name}{' '}
                                                            {user.last_name}
                                                        </span>

                                                    </div>

                                                </TableCell>



                                                {/* Correo */}
                                                <TableCell className="text-gray-500">

                                                    {
                                                        user.email
                                                    }

                                                </TableCell>



                                                {/* Departamento */}
                                                <TableCell>

                                                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">

                                                        {
                                                            user.department.name
                                                        }

                                                    </span>

                                                </TableCell>

                                            </TableRow>

                                        )
                                    )}

                                </TableBody>

                            </Table>

                        </div>

                    </div>



                    {/* ===================================== */}
                    {/* PAGINACIÓN */}
                    {/* ===================================== */}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        {/* Cantidad de resultados */}
                        <p className="text-sm text-gray-500">

                            Mostrando{' '}

                            {
                                filteredUsers.length === 0
                                    ? 0
                                    : startIndex + 1
                            }

                            {' - '}

                            {
                                Math.min(
                                    startIndex +
                                        usersPerPage,

                                    filteredUsers.length
                                )
                            }

                            {' de '}

                            {
                                filteredUsers.length
                            }

                            {' usuarios'}

                        </p>


                        {/* Botones de páginas */}
                        <div className="flex items-center gap-2">


                            {/* Regresa una página */}
                            <button
                                type="button"

                                disabled={
                                    currentPage === 1
                                }

                                onClick={() =>
                                    setCurrentPage(
                                        (page) =>
                                            Math.max(
                                                page - 1,
                                                1
                                            )
                                    )
                                }

                                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Anterior
                            </button>


                            {/* Página actual */}
                            <span className="px-2 text-sm text-gray-600">

                                Página {currentPage} de {totalPages}

                            </span>


                            {/* Avanza una página */}
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
                                                page + 1,
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



                    {/* ===================================== */}
                    {/* MODAL REGISTRAR USUARIO */}
                    {/* ===================================== */}

                    <Dialog
                        open={showCreateUser}

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


                                    {/* Al hacer clic abre selector de archivos */}
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


                                                {/* Texto que aparece al pasar el mouse */}
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


                                    {/* Selector de fotografía oculto */}
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


                                    {/* Error de fotografía */}
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


                                    {/* Nombre */}
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



                                    {/* Apellido */}
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


                                    {/* Empresa */}
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
                                                (company) => (

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

                                                )
                                            )}

                                        </select>


                                        {createForm.errors.company_id && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {
                                                    createForm.errors.company_id
                                                }

                                            </p>

                                        )}

                                    </div>



                                    {/* Departamento */}
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
                                                (department) => (

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


                                        {createForm.errors.department_id && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {
                                                    createForm.errors.department_id
                                                }

                                            </p>

                                        )}

                                    </div>

                                </div>



                                {/* Botones de registro */}
                                <div className="flex justify-end gap-3 border-t pt-5">


                                    {/* Cierra sin guardar */}
                                    <button
                                        type="button"

                                        onClick={
                                            closeCreateUser
                                        }

                                        className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>


                                    {/* Envía datos a Laravel */}
                                    <button
                                        type="submit"

                                        disabled={
                                            createForm.processing
                                        }

                                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                                    >

                                        {
                                            createForm.processing
                                                ? 'Registrando...'
                                                : 'Registrar usuario'
                                        }

                                    </button>

                                </div>

                            </form>

                        </DialogContent>

                    </Dialog>



                    {/* ===================================== */}
                    {/* MODAL INFORMACIÓN / EDITAR */}
                    {/* ===================================== */}

                    <Dialog
                        open={
                            selectedUser !== null
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

                                    {
                                        isEditing
                                            ? 'Editar usuario'
                                            : 'Información del usuario'
                                    }

                                </DialogTitle>

                            </DialogHeader>



                            {/* ================================= */}
                            {/* INFORMACIÓN DEL USUARIO */}
                            {/* ================================= */}

                            {selectedUser && !isEditing && (

                                <div className="space-y-6">


                                    {/* Fotografía del usuario */}
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



                                    {/* Información */}
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


                                        {/* Fechas */}
                                        <div className="space-y-5">

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

                                    </div>



                                    {/* Botones */}
                                    <div className="flex justify-between border-t pt-5">


                                        {/* Abre confirmación */}
                                        <button
                                            type="button"

                                            onClick={
                                                deleteUser
                                            }

                                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                                        >
                                            Eliminar
                                        </button>


                                        {/* Activa edición */}
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



                            {/* ================================= */}
                            {/* EDITAR USUARIO */}
                            {/* ================================= */}

                            {selectedUser && isEditing && (

                                <form
                                    onSubmit={submit}

                                    className="space-y-5"
                                >


                                    {/* Foto editable */}
                                    <div className="flex flex-col items-center">


                                        {/* Foto funciona como botón */}
                                        <label
                                            htmlFor="edit-photo"

                                            className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm"
                                        >


                                            {
                                                editPhotoPreview ||
                                                selectedUser.photo_path
                                                    ? (

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

                                                    )
                                                    : (

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


                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">

                                                                <span className="text-sm font-medium text-white">
                                                                    Agregar foto
                                                                </span>

                                                            </div>

                                                        </>

                                                    )
                                            }

                                        </label>


                                        {/* Selector oculto */}
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


                                        {/* Texto para cambiar foto */}
                                        <label
                                            htmlFor="edit-photo"

                                            className="mt-2 cursor-pointer text-sm text-gray-500 hover:text-gray-900"
                                        >

                                            {
                                                editPhotoPreview ||
                                                selectedUser.photo_path
                                                    ? 'Cambiar foto'
                                                    : 'Agregar foto'
                                            }

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
                                                    (company) => (

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

                                                    )
                                                )}

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
                                                    (department) => (

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


                                            {errors.department_id && (

                                                <p className="mt-1 text-sm text-red-500">

                                                    {
                                                        errors.department_id
                                                    }

                                                </p>

                                            )}

                                        </div>

                                    </div>



                                    {/* Botones de edición */}
                                    <div className="flex justify-end gap-3 border-t pt-5">


                                        {/* Cancela los cambios */}
                                        <button
                                            type="button"

                                            onClick={
                                                cancelEditing
                                            }

                                            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>


                                        {/* Guarda datos y foto nueva */}
                                        <button
                                            type="submit"

                                            disabled={
                                                processing
                                            }

                                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                                        >

                                            {
                                                processing
                                                    ? 'Guardando...'
                                                    : 'Guardar cambios'
                                            }

                                        </button>

                                    </div>

                                </form>

                            )}

                        </DialogContent>

                    </Dialog>



                    {/* ===================================== */}
                    {/* CONFIRMACIÓN DE ELIMINACIÓN */}
                    {/* ===================================== */}

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


                                {/* Cierra sin eliminar */}
                                <AlertDialogCancel>
                                    Cancelar
                                </AlertDialogCancel>


                                {/* Elimina definitivamente */}
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
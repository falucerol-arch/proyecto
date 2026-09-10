import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

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

    // Estados de los modales
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);

    // Vistas previas de las fotografías
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);


    // Formulario para editar usuario
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
        photo: null as File | null,
    });


    // Formulario para registrar usuario
    const createForm = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        company_id: '',
        department_id: '',
        photo: null as File | null,
    });


    // Seleccionar fotografía al registrar
    const handleCreatePhoto = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) return;

        createForm.setData('photo', file);

        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhotoPreview(
            URL.createObjectURL(file)
        );
    };


    // Seleccionar nueva fotografía al editar
    const handleEditPhoto = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) return;

        setData('photo', file);

        if (editPhotoPreview) {
            URL.revokeObjectURL(editPhotoPreview);
        }

        setEditPhotoPreview(
            URL.createObjectURL(file)
        );
    };


    // Cerrar formulario de registro
    const closeCreateUser = () => {

        setShowCreateUser(false);

        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhotoPreview(null);

        createForm.reset();
        createForm.clearErrors();
    };


    // Registrar usuario
    const submitCreateUser = (
        e: FormEvent
    ) => {

        e.preventDefault();

        createForm.post('/usuarios', {

            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                closeCreateUser();
            },
        });
    };


    // Abrir modo edición
    const startEditing = () => {

        if (!selectedUser) return;

        clearErrors();

        if (editPhotoPreview) {
            URL.revokeObjectURL(editPhotoPreview);
        }

        setEditPhotoPreview(null);

        setData({
            _method: 'patch',
            first_name: selectedUser.first_name,
            last_name: selectedUser.last_name,
            email: selectedUser.email,
            company_id: String(selectedUser.company.id),
            department_id: String(selectedUser.department.id),
            photo: null,
        });

        setIsEditing(true);
    };


    // Cancelar edición
    const cancelEditing = () => {

        if (editPhotoPreview) {
            URL.revokeObjectURL(editPhotoPreview);
        }

        setEditPhotoPreview(null);

        reset();
        clearErrors();

        setIsEditing(false);
    };


    // Guardar cambios
    const submit = (
        e: FormEvent
    ) => {

        e.preventDefault();

        if (!selectedUser) return;

        postEdit(
            `/usuarios/${selectedUser.id}`,
            {

                forceFormData: true,
                preserveScroll: true,
                preserveState: false,

                onSuccess: () => {

                    if (editPhotoPreview) {
                        URL.revokeObjectURL(editPhotoPreview);
                    }

                    setEditPhotoPreview(null);

                    setIsEditing(false);
                    setSelectedUser(null);
                },
            }
        );
    };


    // Cerrar modal del usuario
    const closeDialog = () => {

        if (editPhotoPreview) {
            URL.revokeObjectURL(editPhotoPreview);
        }

        setEditPhotoPreview(null);

        setSelectedUser(null);
        setIsEditing(false);

        reset();
        clearErrors();
    };


    // Abrir confirmación para eliminar
    const deleteUser = () => {

        if (!selectedUser) return;

        setShowDeleteConfirm(true);
    };


    // Eliminar usuario
    const confirmDelete = () => {

        if (!selectedUser) return;

        router.delete(
            `/usuarios/${selectedUser.id}`,
            {

                preserveScroll: true,

                onSuccess: () => {

                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                    setIsEditing(false);
                },
            }
        );
    };


    // Formato de fecha para Guatemala
    const formatDate = (
        date: string
    ) => {

        return new Date(date).toLocaleString(
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

                <Head title="Personal" />


                {/* Encabezado */}
                <div className="mb-6 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Personal
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Personal registrado.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setShowCreateUser(true)
                        }
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Registrar usuario
                    </button>

                </div>



                {/* Tabla de usuarios */}
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

                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}

            </div>

        )}

        <span>
            {user.first_name} {user.last_name}
        </span>

    </div>

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



                {/* Modal para registrar usuario */}
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
                            onSubmit={submitCreateUser}
                            className="space-y-5"
                        >


                            {/* Fotografía */}
                            <div className="flex flex-col items-center">


                                <label
                                    htmlFor="create-photo"
                                    className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition hover:border-gray-500"
                                >

                                    {photoPreview ? (

                                        <>

                                            <img
                                                src={photoPreview}
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
                                    onChange={handleCreatePhoto}
                                    className="hidden"
                                />


                                <p className="mt-2 text-xs text-gray-500">

                                    Haz clic en la foto para seleccionar o tomar una imagen

                                </p>


                                {createForm.errors.photo && (

                                    <p className="mt-1 text-sm text-red-500">

                                        {createForm.errors.photo}

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

                                            {createForm.errors.first_name}

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

                                            {createForm.errors.last_name}

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

                                        {createForm.errors.email}

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

                                        {createForm.errors.password}

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
                                            (company) => (

                                                <option
                                                    key={company.id}
                                                    value={company.id}
                                                >
                                                    {company.name}
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
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.name}
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



                            {/* Acciones del registro */}
                            <div className="flex justify-end gap-3 border-t pt-5">


                                <button
                                    type="button"

                                    onClick={
                                        closeCreateUser
                                    }

                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>


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



                {/* Modal de información y edición */}
                <Dialog
                    open={selectedUser !== null}

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



                        {/* Información del usuario */}
                        {selectedUser && !isEditing && (

                            <div className="space-y-6">


                                {/* Foto del usuario */}
                                <div className="flex justify-center">

                                    {selectedUser.photo_path ? (

                                        <img
                                            src={
                                                `/usuarios/${selectedUser.id}/foto?v=${encodeURIComponent(
                                                    selectedUser.updated_at
                                                )}`
                                            }

                                            alt={
                                                `${selectedUser.first_name} ${selectedUser.last_name}`
                                            }

                                            className="h-28 w-28 rounded-full border object-cover shadow-sm"
                                        />

                                    ) : (

                                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-500">

                                            {
                                                selectedUser.first_name.charAt(0)
                                            }

                                            {
                                                selectedUser.last_name.charAt(0)
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



                                    <div>

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



                                {/* Acciones */}
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



                        {/* Formulario para editar usuario */}
                        {selectedUser && isEditing && (

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >


                                {/* Foto editable */}
                                <div className="flex flex-col items-center">


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

                                                            alt={
                                                                `${selectedUser.first_name} ${selectedUser.last_name}`
                                                            }

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
                                                                selectedUser.first_name.charAt(0)
                                                            }

                                                            {
                                                                selectedUser.last_name.charAt(0)
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

                                        {
                                            editPhotoPreview ||
                                            selectedUser.photo_path
                                                ? 'Cambiar foto'
                                                : 'Agregar foto'
                                        }

                                    </label>


                                    {errors.photo && (

                                        <p className="mt-1 text-sm text-red-500">

                                            {errors.photo}

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

                                                {errors.first_name}

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

                                                {errors.last_name}

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

                                            {errors.email}

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
                                                        key={company.id}
                                                        value={company.id}
                                                    >
                                                        {company.name}
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        {errors.company_id && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {errors.company_id}

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
                                                        key={department.id}
                                                        value={department.id}
                                                    >
                                                        {department.name}
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        {errors.department_id && (

                                            <p className="mt-1 text-sm text-red-500">

                                                {errors.department_id}

                                            </p>

                                        )}

                                    </div>

                                </div>



                                {/* Acciones de edición */}
                                <div className="flex justify-end gap-3 border-t pt-5">


                                    <button
                                        type="button"
                                        onClick={cancelEditing}

                                        className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>


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



                {/* Confirmación para eliminar */}
                <AlertDialog
                    open={showDeleteConfirm}

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

                            <AlertDialogCancel>
                                Cancelar
                            </AlertDialogCancel>


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
    );
}
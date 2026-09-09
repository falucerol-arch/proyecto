
import { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';

type Company = {
    id: number;
    name: string;
};

type Department = {
    id: number;
    name: string;
};

type Props = {
    companies: Company[];
    departments: Department[];
};

export default function Create({ companies, departments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        company_id: '',
        department_id: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/usuarios');
    };

    return (
    <div className="mx-auto max-w-2xl p-8">

        <Link
            href="/usuarios"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
            ← Volver al directorio
        </Link>

        <h1 className="mb-6 text-2xl font-bold">
            Crear usuario
        </h1>

            <form onSubmit={submit} className="space-y-5">

                <div>
                    <label>Nombre</label>

                    <input
                        type="text"
                        value={data.first_name}
                        onChange={(e) =>
                            setData('first_name', e.target.value)
                        }
                        className="mt-1 w-full rounded border p-2"
                    />

                    {errors.first_name && (
                        <p className="text-red-500">
                            {errors.first_name}
                        </p>
                    )}
                </div>

                <div>
                    <label>Apellido</label>

                    <input
                        type="text"
                        value={data.last_name}
                        onChange={(e) =>
                            setData('last_name', e.target.value)
                        }
                        className="mt-1 w-full rounded border p-2"
                    />

                    {errors.last_name && (
                        <p className="text-red-500">
                            {errors.last_name}
                        </p>
                    )}
                </div>

                <div>
                    <label>Correo electrónico</label>

                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                            setData('email', e.target.value)
                        }
                        className="mt-1 w-full rounded border p-2"
                    />

                    {errors.email && (
                        <p className="text-red-500">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label>Contraseña</label>

                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) =>
                            setData('password', e.target.value)
                        }
                        className="mt-1 w-full rounded border p-2"
                    />

                    {errors.password && (
                        <p className="text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <label>Empresa</label>

                    <select
                        value={data.company_id}
                        onChange={(e) =>
                            setData('company_id', e.target.value)
                        }
                        className="mt-1 w-full rounded border p-2"
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
                        <p className="text-red-500">
                            {errors.company_id}
                        </p>
                    )}
                </div>

                <div>
                    <label>Departamento</label>

                    <select
                        value={data.department_id}
                        onChange={(e) =>
                            setData('department_id', e.target.value)
                        }
                        className="mt-1 w-full rounded border p-2"
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
                        <p className="text-red-500">
                            {errors.department_id}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    {processing
                        ? 'Guardando...'
                        : 'Guardar usuario'}
                </button>

            </form>
        </div>
    );
}
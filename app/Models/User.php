<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Estos campos pueden guardarse utilizando create() o update()
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'company_id',
        'department_id',
        'position',
        'photo_path',
    ];

    // Estos datos no se envían cuando el usuario se convierte a JSON
    protected $hidden = [
        'password',
        'remember_token',
    ];


    // Un usuario pertenece a una empresa
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }


    // Un usuario pertenece a un departamento
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // <- Importamos la herramienta
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;


class Department extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
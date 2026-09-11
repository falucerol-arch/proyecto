<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Evita el error de columna duplicada si la columna ya existe
        if (!Schema::hasColumn('users', 'position')) {

            Schema::table('users', function (Blueprint $table) {

                // Guarda el puesto del usuario
                $table->string('position')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'position')) {

            Schema::table('users', function (Blueprint $table) {

                $table->dropColumn('position');
            });
        }
    }
};
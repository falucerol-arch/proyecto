<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('companies', 'country')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('country')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('companies', 'country')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->dropColumn('country');
            });
        }
    }
};
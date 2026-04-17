<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Forzamos el cambio de tipo eliminando y recreando si es necesario, 
        // o usando un cast directo que suele ser más efectivo en Postgres
        DB::statement('ALTER TABLE trip_images ALTER COLUMN image_path SET DATA TYPE TEXT');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE trip_images ALTER COLUMN image_path SET DATA TYPE VARCHAR(255)');
    }
};

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
        Schema::table('trip_images', function (Blueprint $table) {
            // Usamos SQL puro para evitar problemas con Doctrine/Laravel en Postgres
            DB::statement('ALTER TABLE trip_images ALTER COLUMN image_path TYPE TEXT');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trip_images', function (Blueprint $table) {
            $table->string('image_path')->change();
        });
    }
};

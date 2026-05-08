<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop foreign key and brand_id column if it exists
            if (Schema::hasColumn('products', 'brand_id')) {
                $table->dropForeign(['brand_id']);
                $table->dropColumn('brand_id');
            }
            
            // Add brand as string column if it doesn't exist
            if (!Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->nullable()->after('category_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Remove brand string column
            $table->dropColumn('brand');
            
            // Restore brand_id foreign key
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null')->after('category_id');
        });
    }
};

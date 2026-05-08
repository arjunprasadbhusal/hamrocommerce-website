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
        // Add indexes to products table
        Schema::table('products', function (Blueprint $table) {
            $table->index('category_id');
            $table->index('subcategory_id');
            $table->index('stock');
            $table->index('price');
            $table->index('created_at');
        });

        // Add indexes to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('product_id');
            $table->index('status');
            $table->index('created_at');
        });

        // Add indexes to carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('product_id');
            $table->index(['user_id', 'product_id']); // Composite index for faster lookups
        });

        // Add indexes to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['subcategory_id']);
            $table->dropIndex(['stock']);
            $table->dropIndex(['price']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['product_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['product_id']);
            $table->dropIndex(['user_id', 'product_id']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['priority']);
        });
    }
};

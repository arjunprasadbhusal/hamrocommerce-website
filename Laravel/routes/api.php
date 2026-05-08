<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\SubCategoryController;
use App\Http\Controllers\Api\V1\RegisterController;
use App\Http\Controllers\Api\V1\LoginController;
use App\Http\Controllers\Api\V1\LogoutController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\VedioController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\WishlistController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::post('register',[RegisterController::class,'register']);
    Route::post('login',[LoginController::class,'login']);
    
    // Public Product API Routes
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);

    // Public Category API Routes
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{id}', [CategoryController::class, 'show']);

    // Public SubCategory API Routes
    Route::get('subcategories', [SubCategoryController::class, 'index']);
    Route::get('subcategories/{id}', [SubCategoryController::class, 'show']);
    Route::get('categories/{categoryId}/subcategories', [SubCategoryController::class, 'getByCategory']);

    // Public Video API Routes
    Route::get('vedios', [VedioController::class, 'index']);
    Route::get('vedios/active', [VedioController::class, 'active']);
    Route::get('vedios/{id}', [VedioController::class, 'show']);

    // Public Blog API Routes
    Route::get('blogs', [BlogController::class, 'index']);
    Route::get('blogs/{id}', [BlogController::class, 'show']);

    // Public Banner API Routes
    Route::get('banners', [BannerController::class, 'index']);
    Route::get('banners/active', [BannerController::class, 'active']);
    Route::get('banners/{id}', [BannerController::class, 'show']);

    // Public Message API Route (Contact Form)
    Route::post('messages', [MessageController::class, 'store']);
  
});

// User Protected Routes (Auth required)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('logout',[LogoutController::class,'logout']);
    
    // Cart API Routes (User)
    Route::get('mycart', [CartController::class, 'mycart']);
    Route::post('cart', [CartController::class, 'store']);
    Route::put('cart/{id}', [CartController::class, 'update']);
    Route::delete('cart', [CartController::class, 'destroy']);
    Route::get('checkout/{id}', [CartController::class, 'checkout']);
    
    // Wishlist API Routes (User)
    Route::get('mywishlist', [WishlistController::class, 'mywishlist']);
    Route::post('wishlist', [WishlistController::class, 'store']);
    Route::delete('wishlist/{id}', [WishlistController::class, 'destroy']);
    Route::delete('wishlist/product/{productId}', [WishlistController::class, 'destroyByProduct']);
    
    // Order API Routes (User)
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('myorders', [OrderController::class, 'myOrders']);
    Route::post('orders/esewa/{cartid}', [OrderController::class, 'storeEsewa']);
});

// Admin Protected Routes (Auth + Admin role required)
Route::prefix('v1')->middleware(['auth:sanctum', 'isAdmin'])->group(function () {
    
    // Dashboard API Routes (Admin Only)
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('dashboard/sales', [DashboardController::class, 'sales']);
    Route::get('dashboard/users', [DashboardController::class, 'users']);
    Route::get('dashboard/products', [DashboardController::class, 'products']);
    
    // Product Management (Admin Only)
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);

    // Category Management (Admin Only)
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

    // SubCategory Management (Admin Only)
    Route::post('subcategories', [SubCategoryController::class, 'store']);
    Route::put('subcategories/{id}', [SubCategoryController::class, 'update']);
    Route::delete('subcategories/{id}', [SubCategoryController::class, 'destroy']);

    // Video Management (Admin Only)
    Route::post('vedios', [VedioController::class, 'store']);
    Route::put('vedios/{id}', [VedioController::class, 'update']);
    Route::put('vedios/{id}/status', [VedioController::class, 'updateStatus']);
    Route::put('vedios/{id}/priority', [VedioController::class, 'updatePriority']);
    Route::delete('vedios/{id}', [VedioController::class, 'destroy']);

    // Blog Management (Admin Only)
    Route::post('blogs', [BlogController::class, 'store']);
    Route::put('blogs/{id}', [BlogController::class, 'update']);
    Route::delete('blogs/{id}', [BlogController::class, 'destroy']);

    // Banner Management (Admin Only)
    Route::post('banners', [BannerController::class, 'store']);
    Route::put('banners/{id}', [BannerController::class, 'update']);
    Route::put('banners/{id}/status', [BannerController::class, 'updateStatus']);
    Route::put('banners/{id}/priority', [BannerController::class, 'updatePriority']);
    Route::delete('banners/{id}', [BannerController::class, 'destroy']);
    
    // Order Management (Admin Only)
    Route::get('orders', [OrderController::class, 'index']);
    Route::put('orders/{id}/status/{status}', [OrderController::class, 'status']);
    Route::delete('orders/{id}', [OrderController::class, 'destroy']);
    
    // User Profile (Authenticated User)
    Route::get('user', [UserController::class, 'profile']);
    Route::put('user/update', [UserController::class, 'updateProfile']);
    
    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    
    // User Management (Admin Only)
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::put('users/{id}', [UserController::class, 'update']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);

    // Message Management (Admin Only)
    Route::get('messages', [MessageController::class, 'index']);
    Route::get('messages/{id}', [MessageController::class, 'show']);
    Route::put('messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::delete('messages/{id}', [MessageController::class, 'destroy']);
});
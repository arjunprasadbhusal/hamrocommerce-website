<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;
use App\Models\Blog;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(): JsonResponse
    {
        $data = Cache::remember('dashboard_index', 30, function () {
            // Total counts
            $totalUsers = User::count();
            $totalProducts = Product::count();
            $totalOrders = Order::count();
            $totalBlogs = Blog::count();
            $totalBanners = Banner::count();

            // Total Revenue (excluding cancelled orders)
            $totalRevenue = Order::where('status', '!=', 'cancelled')
                ->sum(DB::raw('price * quantity'));

            // Recent orders with calculated total
            $recentOrders = Order::with('user:id,name')
                ->select('id', 'user_id', 'name', 'price', 'quantity', 'status', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'user_name' => $order->name,
                        'total' => $order->price * $order->quantity,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                    ];
                });

            // Low stock products (stock < 10)
            $lowStockProducts = Product::select('id', 'name', 'stock')
                ->where('stock', '<', 10)
                ->orderBy('stock', 'asc')
                ->limit(5)
                ->get();

            // Top ordered products by users (for pie chart)
            $topOrderedProducts = Order::select('products.name as product_name', DB::raw('SUM(orders.quantity) as total_quantity'))
                ->join('products', 'orders.product_id', '=', 'products.id')
                ->groupBy('products.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(6)
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'value' => (int)$item->total_quantity,
                    ];
                });

            // Orders over last 7 days (for line chart)
            $ordersOverTime = Order::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(price * quantity) as revenue')
                )
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => date('M d', strtotime($item->date)),
                        'orders' => $item->count,
                        'revenue' => $item->revenue,
                    ];
                });

            return [
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'totalUsers' => $totalUsers,
                'totalBlogs' => $totalBlogs,
                'totalBanners' => $totalBanners,
                'recentOrders' => $recentOrders,
                'lowStockProducts' => $lowStockProducts,
                'topOrderedProducts' => $topOrderedProducts,
                'ordersOverTime' => $ordersOverTime,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Dashboard data retrieved successfully'
        ], 200);
    }

    /**
     * Get sales statistics
     */
    public function sales(): JsonResponse
    {
        $data = Cache::remember('dashboard_sales', 30, function () {
            // Sales by month (last 12 months)
            $salesByMonth = Order::select(
                    DB::raw('strftime("%Y-%m", created_at) as month'),
                    DB::raw('SUM(price * quantity) as total'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('status', '!=', 'cancelled')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->get();

            // Sales by payment method
            $salesByPayment = Order::select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(price * quantity) as total'))
                ->where('status', '!=', 'cancelled')
                ->groupBy('payment_method')
                ->get();

            return [
                'sales_by_month' => $salesByMonth,
                'sales_by_payment' => $salesByPayment,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Sales data retrieved successfully'
        ], 200);
    }

    /**
     * Get user statistics
     */
    public function users(): JsonResponse
    {
        $data = Cache::remember('dashboard_users', 30, function () {
            $usersByRole = User::select('role', DB::raw('COUNT(*) as count'))
                ->groupBy('role')
                ->get();

            $newUsersThisMonth = User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            return [
                'users_by_role' => $usersByRole,
                'new_users_this_month' => $newUsersThisMonth,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'User statistics retrieved successfully'
        ], 200);
    }

    /**
     * Get product statistics
     */
    public function products(): JsonResponse
    {
        $data = Cache::remember('dashboard_products', 30, function () {
            $productsByCategory = Product::select('categories.name as category', DB::raw('COUNT(products.id) as count'))
                ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->groupBy('categories.name')
                ->get();

            $productsByBrand = Product::select('products.brand as brand', DB::raw('COUNT(products.id) as count'))
                ->groupBy('products.brand')
                ->get();

            $outOfStockProducts = Product::where('stock', 0)->count();
            $lowStockProducts = Product::where('stock', '>', 0)->where('stock', '<', 10)->count();

            return [
                'products_by_category' => $productsByCategory,
                'products_by_brand' => $productsByBrand,
                'out_of_stock' => $outOfStockProducts,
                'low_stock' => $lowStockProducts,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Product statistics retrieved successfully'
        ], 200);
    }
}


<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
  
    public function index(Request $request): JsonResponse
    {
        // Get pagination params
        $perPage = $request->input('per_page', null);
        $page = $request->input('page', 1);
        
        // If per_page is 'all' or null, return all products without pagination
        if ($perPage === 'all' || $perPage === null) {
            $cacheKey = "products_all";
            
            // Cache for 30 seconds (fast updates)
            $products = Cache::remember($cacheKey, 30, function () {
                return Product::with(['category:id,name', 'subcategory:id,name'])
                    ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
                    ->orderBy('id', 'asc')
                    ->get();
            });
            
            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Products retrieved successfully'
            ], 200);
        }
        
        // Otherwise use pagination
        $cacheKey = "products_page_{$page}_per_{$perPage}";
        
        // Cache for 30 seconds (fast updates)
        $products = Cache::remember($cacheKey, 30, function () use ($perPage) {
            return Product::with(['category:id,name', 'subcategory:id,name'])
                ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
                ->orderBy('id', 'asc')
                ->paginate($perPage);
        });
        
        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
            'message' => 'Products retrieved successfully'
        ], 200);
    }

   
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'photopath' => 'nullable|image|max:5242880',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'brand' => 'nullable|string|max:255',
            'subcategory_id' => 'nullable|exists:subcategories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('photopath')) {
            $data['photopath'] = $request->file('photopath')->store('products', 'public');
        }

        $product = Product::create($data);

        // Clear cache after creation
        Cache::flush(); // Clear all product list caches

        return response()->json([
            'success' => true,
            'data' => $product->load(['category', 'subcategory']),
            'message' => 'Product created successfully'
        ], 201);
    }

   
    public function show(string $id): JsonResponse
    {
        // Cache individual product for 1 minute
        $product = Cache::remember("product_{$id}", 60, function () use ($id) {
            return Product::with(['category:id,name', 'subcategory:id,name'])
                ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
                ->find($id);
        });

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product retrieved successfully'
        ], 200);
    }

    
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'photopath' => 'nullable|image|max:5242880',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'brand' => 'nullable|string|max:255',
            'subcategory_id' => 'nullable|exists:subcategories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('photopath')) {
            if ($product->photopath) {
                Storage::disk('public')->delete($product->photopath);
            }
            $data['photopath'] = $request->file('photopath')->store('products', 'public');
        }

        $product->update($data);

        // Clear cache after update
        Cache::forget("product_{$id}");
        Cache::flush(); // Clear all product list caches

        return response()->json([
            'success' => true,
            'data' => $product->load(['category:id,name', 'subcategory:id,name']),
            'message' => 'Product updated successfully'
        ], 200);
    }

   
    public function destroy(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        if ($product->photopath) {
            Storage::disk('public')->delete($product->photopath);
        }

        $product->delete();

        // Clear cache after deletion
        Cache::forget("product_{$id}");
        Cache::flush(); // Clear all product list caches

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ], 200);
    }
}

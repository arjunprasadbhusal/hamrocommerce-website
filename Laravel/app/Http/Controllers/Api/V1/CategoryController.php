<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /** GET /api/v1/categories */
    public function index(): JsonResponse
    {
        // Cache categories for 30 seconds (fast updates)
        $categories = Cache::remember('categories_all', 30, function () {
            return Category::select('id', 'name', 'priority')
                ->orderByDesc('priority')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Categories retrieved successfully'
        ], 200);
    }

    /** POST /api/v1/categories */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
            'priority' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Set default priority if not provided
        if (!isset($data['priority'])) {
            $data['priority'] = 0;
        }

        $category = Category::create($data);

        // Clear cache after creation
        Cache::forget('categories_all');

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category created successfully'
        ], 201);
    }

    /** GET /api/v1/categories/{id} */
    public function show(string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category retrieved successfully'
        ], 200);
    }

    /** PUT/PATCH /api/v1/categories/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'priority' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($validator->validated());

        // Clear cache
        Cache::forget('categories_all');

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category updated successfully'
        ], 200);
    }

    /** DELETE /api/v1/categories/{id} */
    public function destroy(string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $category->delete();

        // Clear cache after deletion
        Cache::forget('categories_all');

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ], 200);
    }
}
        
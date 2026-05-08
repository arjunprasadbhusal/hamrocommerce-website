<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubCategoryController extends Controller
{
    /**
     * Display a listing of subcategories.
     */
    public function index()
    {
        $subcategories = Subcategory::with('category')->get();
        
        return response()->json([
            'success' => true,
            'data' => $subcategories
        ]);
    }

    /**
     * Store a newly created subcategory.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => 'sometimes|string|in:Active,Inactive'
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;

        while (Subcategory::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $subcategory = Subcategory::create([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'status' => $request->status ?? 'Active',
            'slug' => $slug
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subcategory created successfully',
            'subcategory' => $subcategory->load('category')
        ], 201);
    }

    /**
     * Display the specified subcategory.
     */
    public function show($id)
    {
        $subcategory = Subcategory::with('category')->find($id);

        if (!$subcategory) {
            return response()->json([
                'success' => false,
                'message' => 'Subcategory not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'subcategory' => $subcategory
        ]);
    }

    /**
     * Update the specified subcategory.
     */
    public function update(Request $request, $id)
    {
        $subcategory = Subcategory::find($id);

        if (!$subcategory) {
            return response()->json([
                'success' => false,
                'message' => 'Subcategory not found'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'status' => 'sometimes|string|in:Active,Inactive'
        ]);

        if ($request->has('name') && $request->name !== $subcategory->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;

            while (Subcategory::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $subcategory->slug = $slug;
        }

        if ($request->has('name')) {
            $subcategory->name = $request->name;
        }

        if ($request->has('category_id')) {
            $subcategory->category_id = $request->category_id;
        }

        if ($request->has('status')) {
            $subcategory->status = $request->status;
        }

        $subcategory->save();

        return response()->json([
            'success' => true,
            'message' => 'Subcategory updated successfully',
            'subcategory' => $subcategory->load('category')
        ]);
    }

    /**
     * Remove the specified subcategory.
     */
    public function destroy($id)
    {
        $subcategory = Subcategory::find($id);

        if (!$subcategory) {
            return response()->json([
                'success' => false,
                'message' => 'Subcategory not found'
            ], 404);
        }

        $subcategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subcategory deleted successfully'
        ]);
    }

    /**
     * Get subcategories by category ID.
     */
    public function getByCategory($categoryId)
    {
        $subcategories = Subcategory::where('category_id', $categoryId)
            ->where('status', 'Active')
            ->get();

        return response()->json([
            'success' => true,
            'subcategories' => $subcategories
        ]);
    }
}

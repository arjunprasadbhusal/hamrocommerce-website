<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    /**
     * Display a listing of blogs.
     */
    public function index()
    {
        try {
            $blogs = Cache::remember('blogs_all', 300, function () {
                return Blog::orderBy('created_at', 'desc')
                    ->paginate(10);
            });

            return response()->json([
                'success' => true,
                'data' => $blogs
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blogs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created blog.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'photopath' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['title', 'description']);

            // Handle file upload
            if ($request->hasFile('photopath')) {
                $file = $request->file('photopath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('blogs', $filename, 'public');
                $data['photopath'] = $path;
            }

            $blog = Blog::create($data);

            // Clear cache
            Cache::forget('blogs_all');

            return response()->json([
                'success' => true,
                'message' => 'Blog created successfully',
                'data' => $blog
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified blog.
     */
    public function show($id)
    {
        try {
            $blog = Cache::remember("blog_{$id}", 300, function () use ($id) {
                return Blog::find($id);
            });

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $blog
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified blog.
     */
    public function update(Request $request, $id)
    {
        try {
            $blog = Blog::find($id);

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'photopath' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['title', 'description']);

            // Handle file upload
            if ($request->hasFile('photopath')) {
                // Delete old file if exists
                if ($blog->photopath && Storage::disk('public')->exists($blog->photopath)) {
                    Storage::disk('public')->delete($blog->photopath);
                }

                $file = $request->file('photopath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('blogs', $filename, 'public');
                $data['photopath'] = $path;
            }

            $blog->update($data);

            // Clear cache
            Cache::forget('blogs_all');
            Cache::forget("blog_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Blog updated successfully',
                'data' => $blog->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified blog.
     */
    public function destroy($id)
    {
        try {
            $blog = Blog::find($id);

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            // Delete photo if exists
            if ($blog->photopath && Storage::disk('public')->exists($blog->photopath)) {
                Storage::disk('public')->delete($blog->photopath);
            }

            $blog->delete();

            // Clear cache
            Cache::forget('blogs_all');
            Cache::forget("blog_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

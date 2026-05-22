<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TestimonialController extends Controller
{
    /**
     * Display a listing of testimonials.
     */
    public function index()
    {
        try {
            $testimonials = Cache::remember('testimonials_all', 300, function () {
                return Testimonial::orderBy('created_at', 'desc')->get();
            });

            return response()->json([
                'success' => true,
                'data' => $testimonials
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch testimonials',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created testimonial.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'photopath' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['name', 'title', 'description']);

            if ($request->hasFile('photopath')) {
                $file = $request->file('photopath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('testimonials', $filename, 'public');
                $data['photopath'] = $path;
            }

            $testimonial = Testimonial::create($data);

            Cache::forget('testimonials_all');
            return response()->json([
                'success' => true,
                'message' => 'Testimonial created successfully',
                'data' => $testimonial
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified testimonial.
     */
    public function show($id)
    {
        try {
            $testimonial = Cache::remember("testimonial_{$id}", 300, function () use ($id) {
                return Testimonial::find($id);
            });

            if (!$testimonial) {
                return response()->json([
                    'success' => false,
                    'message' => 'Testimonial not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $testimonial
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified testimonial.
     */
    public function update(Request $request, $id)
    {
        try {
            $testimonial = Testimonial::find($id);

            if (!$testimonial) {
                return response()->json([
                    'success' => false,
                    'message' => 'Testimonial not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'photopath' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['name', 'title', 'description']);

            if ($request->hasFile('photopath')) {
                if ($testimonial->photopath && Storage::disk('public')->exists($testimonial->photopath)) {
                    Storage::disk('public')->delete($testimonial->photopath);
                }

                $file = $request->file('photopath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('testimonials', $filename, 'public');
                $data['photopath'] = $path;
            }

            $testimonial->update($data);

            Cache::forget('testimonials_all');
            Cache::forget("testimonial_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Testimonial updated successfully',
                'data' => $testimonial->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified testimonial.
     */
    public function destroy($id)
    {
        try {
            $testimonial = Testimonial::find($id);

            if (!$testimonial) {
                return response()->json([
                    'success' => false,
                    'message' => 'Testimonial not found'
                ], 404);
            }

            if ($testimonial->photopath && Storage::disk('public')->exists($testimonial->photopath)) {
                Storage::disk('public')->delete($testimonial->photopath);
            }

            $testimonial->delete();

            Cache::forget('testimonials_all');
            Cache::forget("testimonial_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Testimonial deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete testimonial',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * Display a listing of banners.
     */
    public function index()
    {
        try {
            $banners = Cache::remember('banners_all', 300, function () {
                return Banner::orderBy('priority', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $banners
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch banners',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active banners only.
     */
    public function active()
    {
        try {
            $banners = Cache::remember('banners_active', 300, function () {
                return Banner::where('status', 'active')
                    ->orderBy('priority', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $banners
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active banners',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created banner.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240',
                'priority' => 'nullable|integer|min:0',
                'status' => 'nullable|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['title', 'priority', 'status']);
            $data['priority'] = $data['priority'] ?? 0;
            $data['status'] = $data['status'] ?? 'active';

            // Handle file upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($banner->image && Storage::disk('public')->exists($banner->image)) {
                    Storage::disk('public')->delete($banner->image);
                }

                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('banners', $filename, 'public');
                $data['image'] = $path;
            }

            $banner = Banner::create($data);

            // Clear cache
            Cache::forget('banners_all');
            Cache::forget('banners_active');

            return response()->json([
                'success' => true,
                'message' => 'Banner created successfully',
                'data' => $banner
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified banner.
     */
    public function show($id)
    {
        try {
            $banner = Cache::remember("banner_{$id}", 300, function () use ($id) {
                return Banner::find($id);
            });

            if (!$banner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banner not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $banner
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified banner.
     */
    public function update(Request $request, $id)
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banner not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|nullable|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:10240',
                'priority' => 'nullable|integer|min:0',
                'status' => 'nullable|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['title', 'priority', 'status']);

            // Handle file upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('banners', $filename, 'public');
                $data['image'] = $path;
            }

            $banner->update($data);

            // Clear cache
            Cache::forget('banners_all');
            Cache::forget('banners_active');
            Cache::forget("banner_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Banner updated successfully',
                'data' => $banner->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update banner status.
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banner not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $banner->update(['status' => $request->status]);

            // Clear cache
            Cache::forget('banners_all');
            Cache::forget('banners_active');
            Cache::forget("banner_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Banner status updated successfully',
                'data' => $banner->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update banner priority.
     */
    public function updatePriority(Request $request, $id)
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banner not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'priority' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $banner->update(['priority' => $request->priority]);

            // Clear cache
            Cache::forget('banners_all');
            Cache::forget('banners_active');
            Cache::forget("banner_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Banner priority updated successfully',
                'data' => $banner->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner priority',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified banner.
     */
    public function destroy($id)
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banner not found'
                ], 404);
            }

            // Delete image if exists
            if ($banner->image && Storage::disk('public')->exists($banner->image)) {
                Storage::disk('public')->delete($banner->image);
            }

            $banner->delete();

            // Clear cache
            Cache::forget('banners_all');
            Cache::forget('banners_active');
            Cache::forget("banner_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Banner deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

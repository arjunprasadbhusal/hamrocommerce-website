<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Leadership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LeadershipController extends Controller
{
    /**
     * Display a listing of leadership entries.
     */
    public function index()
    {
        try {
            $leaderships = Cache::remember('leaderships_all', 300, function () {
                return Leadership::orderBy('created_at', 'desc')->get();
            });

            return response()->json([
                'success' => true,
                'data' => $leaderships
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch leaderships',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created leadership entry.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'photopath' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['name', 'title']);

            if ($request->hasFile('photopath')) {
                $file = $request->file('photopath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('leaderships', $filename, 'public');
                $data['photopath'] = $path;
            }

            $leadership = Leadership::create($data);

            Cache::forget('leaderships_all');

            return response()->json([
                'success' => true,
                'message' => 'Leadership created successfully',
                'data' => $leadership
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create leadership',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified leadership entry.
     */
    public function show($id)
    {
        try {
            $leadership = Cache::remember("leadership_{$id}", 300, function () use ($id) {
                return Leadership::find($id);
            });

            if (!$leadership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leadership not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $leadership
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch leadership',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified leadership entry.
     */
    public function update(Request $request, $id)
    {
        try {
            $leadership = Leadership::find($id);

            if (!$leadership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leadership not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'title' => 'sometimes|required|string|max:255',
                'photopath' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['name', 'title']);

            if ($request->hasFile('photopath')) {
                $file = $request->file('photopath');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('leaderships', $filename, 'public');
                $data['photopath'] = $path;
            }

            $leadership->update($data);

            Cache::forget('leaderships_all');
            Cache::forget("leadership_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Leadership updated successfully',
                'data' => $leadership->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update leadership',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified leadership entry.
     */
    public function destroy($id)
    {
        try {
            $leadership = Leadership::find($id);

            if (!$leadership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leadership not found'
                ], 404);
            }

            if ($leadership->photopath && Storage::disk('public')->exists($leadership->photopath)) {
                Storage::disk('public')->delete($leadership->photopath);
            }

            $leadership->delete();

            Cache::forget('leaderships_all');
            Cache::forget("leadership_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Leadership deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete leadership',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

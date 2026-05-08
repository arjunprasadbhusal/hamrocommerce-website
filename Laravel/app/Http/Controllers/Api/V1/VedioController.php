<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Vedio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class VedioController extends Controller
{
    /**
     * Display a listing of videos.
     */
    public function index(): JsonResponse
    {
        $vedios = Vedio::orderBy('priority', 'asc')
                       ->orderBy('created_at', 'desc')
                       ->get();
        
        return response()->json([
            'success' => true,
            'data' => $vedios,
            'message' => 'Videos retrieved successfully'
        ], 200);
    }

    /**
     * Display only active/shown videos (for public/frontend).
     */
    public function active(): JsonResponse
    {
        $vedios = Vedio::where('status', 'show')
                       ->orderBy('priority', 'asc')
                       ->orderBy('created_at', 'desc')
                       ->get();
        
        return response()->json([
            'success' => true,
            'data' => $vedios,
            'message' => 'Active videos retrieved successfully'
        ], 200);
    }

    /**
     * Store a newly created video.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vedio_file' => 'required|file',
            'priority' => 'required|integer|min:0',
            'status' => 'required|in:show,hide'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $vedioPath = null;
        if ($request->hasFile('vedio_file')) {
            $vedioPath = $request->file('vedio_file')->store('vedios', 'public');
        }

        $vedio = Vedio::create([
            'vedio_url' => $vedioPath,
            'priority' => $request->priority,
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'data' => $vedio,
            'message' => 'Video created successfully'
        ], 201);
    }

    /**
     * Display the specified video.
     */
    public function show(string $id): JsonResponse
    {
        $vedio = Vedio::find($id);

        if (!$vedio) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $vedio,
            'message' => 'Video retrieved successfully'
        ], 200);
    }

    /**
     * Update the specified video.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $vedio = Vedio::find($id);

        if (!$vedio) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'vedio_file' => 'nullable|file',
            'priority' => 'sometimes|required|integer|min:0',
            'status' => 'sometimes|required|in:show,hide'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('vedio_file')) {
            // Delete old video file
            if ($vedio->vedio_url && Storage::disk('public')->exists($vedio->vedio_url)) {
                Storage::disk('public')->delete($vedio->vedio_url);
            }
            // Store new video file
            $vedio->vedio_url = $request->file('vedio_file')->store('vedios', 'public');
        }

        if ($request->has('priority')) {
            $vedio->priority = $request->priority;
        }

        if ($request->has('status')) {
            $vedio->status = $request->status;
        }

        $vedio->save();

        return response()->json([
            'success' => true,
            'data' => $vedio,
            'message' => 'Video updated successfully'
        ], 200);
    }

    /**
     * Update video status (show/hide).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $vedio = Vedio::find($id);

        if (!$vedio) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:show,hide'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $vedio->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'data' => $vedio,
            'message' => 'Video status updated successfully'
        ], 200);
    }

    /**
     * Update video priority.
     */
    public function updatePriority(Request $request, string $id): JsonResponse
    {
        $vedio = Vedio::find($id);

        if (!$vedio) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'priority' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $vedio->update(['priority' => $request->priority]);

        return response()->json([
            'success' => true,
            'data' => $vedio,
            'message' => 'Video priority updated successfully'
        ], 200);
    }

    /**
     * Remove the specified video.
     */
    public function destroy(string $id): JsonResponse
    {
        $vedio = Vedio::find($id);

        if (!$vedio) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        $vedio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video deleted successfully'
        ], 200);
    }
}

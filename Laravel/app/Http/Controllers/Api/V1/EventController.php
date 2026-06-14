<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\EventLogger;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_type' => 'required|string|in:view,search,wishlist_add,cart_add,purchase,category_view',
            'product_id' => 'nullable|exists:products,id',
            'category_id' => 'nullable|exists:categories,id',
            'brand' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'visitor_id' => 'nullable|string|max:64',
            'metadata' => 'nullable|array',
            'query' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $user = auth('sanctum')->user();

        if (!$user && empty($data['visitor_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'visitor_id is required for anonymous tracking'
            ], 422);
        }

        $metadata = $data['metadata'] ?? [];
        if (!empty($data['query'])) {
            $metadata['query'] = $data['query'];
        }

        EventLogger::log(
            $user,
            $data['visitor_id'] ?? null,
            $data['event_type'],
            $data['product_id'] ?? null,
            $data['category_id'] ?? null,
            $data['brand'] ?? null,
            isset($data['price']) ? (float) $data['price'] : null,
            $metadata
        );

        return response()->json([
            'success' => true,
            'message' => 'Event tracked'
        ]);
    }
}

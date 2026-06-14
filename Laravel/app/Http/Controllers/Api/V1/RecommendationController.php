<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\RecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(private readonly RecommendationService $recommendationService)
    {
    }

    public function home(Request $request): JsonResponse
    {
        [$userId, $visitorId] = $this->resolveIdentity($request);
        $limit = (int) $request->query('limit', 8);

        $data = $this->recommendationService->getHomeRecommendations($userId, $visitorId, $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function product(Request $request, int $productId): JsonResponse
    {
        [$userId, $visitorId] = $this->resolveIdentity($request);
        $limit = (int) $request->query('limit', 8);

        $data = $this->recommendationService->getProductRecommendations($productId, $userId, $visitorId, $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function forYou(Request $request): JsonResponse
    {
        [$userId, $visitorId] = $this->resolveIdentity($request);
        $limit = (int) $request->query('limit', 8);

        $data = $this->recommendationService->getRecommendedForYou($userId, $visitorId, $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function recentlyViewed(Request $request): JsonResponse
    {
        [$userId, $visitorId] = $this->resolveIdentity($request);
        $limit = (int) $request->query('limit', 8);

        $data = $this->recommendationService->getRecentlyViewed($userId, $visitorId, $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function resolveIdentity(Request $request): array
    {
        $user = auth('sanctum')->user();
        $visitorId = $request->query('visitor_id') ?: $request->header('X-Visitor-Id');

        return [$user?->id, $visitorId];
    }
}

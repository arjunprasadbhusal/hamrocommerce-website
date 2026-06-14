<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\UserEvent;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    private const CONTEXT_DAYS = 30;
    private const CACHE_TTL_SECONDS = 120;

    public function getHomeRecommendations(?int $userId, ?string $visitorId, int $limit = 8): array
    {
        $cacheKey = $this->buildCacheKey('home', $userId, $visitorId, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($userId, $visitorId, $limit) {
            return [
                'recommended_for_you' => $this->getRecommendedForYou($userId, $visitorId, $limit),
                'recently_viewed' => $this->getRecentlyViewed($userId, $visitorId, $limit),
            ];
        });
    }

    public function getProductRecommendations(int $productId, ?int $userId, ?string $visitorId, int $limit = 8): array
    {
        $cacheKey = $this->buildCacheKey('product_' . $productId, $userId, $visitorId, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($productId, $userId, $visitorId, $limit) {
            return [
                'because_viewed' => $this->getBecauseViewed($productId, $userId, $visitorId, $limit),
                'similar_products' => $this->getSimilarProducts($productId, $limit),
                'customers_also_bought' => $this->getCustomersAlsoBought($productId, $limit),
                'recently_viewed' => $this->getRecentlyViewed($userId, $visitorId, $limit),
            ];
        });
    }

    public function getRecommendedForYou(?int $userId, ?string $visitorId, int $limit = 8): array
    {
        $events = $this->getRecentEvents($userId, $visitorId);
        if ($events->isEmpty()) {
            return $this->getFallbackProducts($limit);
        }

        $weights = [
            'view' => 1,
            'search' => 0.5,
            'wishlist_add' => 3,
            'cart_add' => 4,
            'purchase' => 5,
            'category_view' => 1.2,
        ];

        $categoryScores = [];
        $brandScores = [];
        $seedProductIds = [];
        $priceBuckets = [];

        foreach ($events as $event) {
            $weight = $weights[$event->event_type] ?? 1;
            $ageDays = max(0.5, now()->diffInDays($event->created_at) + 1);
            $recency = 1 / (1 + ($ageDays / 7));
            $score = $weight * $recency;

            if ($event->category_id) {
                $categoryScores[$event->category_id] = ($categoryScores[$event->category_id] ?? 0) + $score;
            }

            if ($event->brand) {
                $brandScores[$event->brand] = ($brandScores[$event->brand] ?? 0) + $score;
            }

            if ($event->product_id) {
                $seedProductIds[$event->product_id] = true;
            }

            if ($event->price !== null) {
                $bucket = $this->priceBucket($event->price);
                $priceBuckets[$bucket] = ($priceBuckets[$bucket] ?? 0) + $score;
            }
        }

        arsort($categoryScores);
        arsort($brandScores);
        arsort($priceBuckets);

        $topCategoryIds = array_slice(array_keys($categoryScores), 0, 3);
        $topBrands = array_slice(array_keys($brandScores), 0, 3);
        $topBuckets = array_slice(array_keys($priceBuckets), 0, 2);

        $contentCandidates = Product::query()
            ->when(!empty($topCategoryIds), function ($query) use ($topCategoryIds) {
                $query->orWhereIn('category_id', $topCategoryIds);
            })
            ->when(!empty($topBrands), function ($query) use ($topBrands) {
                $query->orWhereIn('brand', $topBrands);
            })
            ->when(!empty($topBuckets), function ($query) use ($topBuckets) {
                $query->orWhere(function ($q) use ($topBuckets) {
                    foreach ($topBuckets as $bucket) {
                        [$min, $max] = $this->bucketRange($bucket);
                        $q->orWhereBetween('price', [$min, $max]);
                    }
                });
            })
            ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
            ->limit(120)
            ->get();

        $collabCandidates = $this->getCollaborativeCandidates(array_keys($seedProductIds), $userId, $limit * 4);

        $combined = $contentCandidates->merge($collabCandidates)->unique('id');

        if ($combined->isEmpty()) {
            return $this->getFallbackProducts($limit);
        }

        $scored = $combined->map(function ($product) use ($categoryScores, $brandScores, $priceBuckets) {
            $score = 0;

            if ($product->category_id && isset($categoryScores[$product->category_id])) {
                $score += $categoryScores[$product->category_id];
            }

            if ($product->brand && isset($brandScores[$product->brand])) {
                $score += $brandScores[$product->brand];
            }

            $bucket = $this->priceBucket($product->price);
            if (isset($priceBuckets[$bucket])) {
                $score += $priceBuckets[$bucket] * 0.6;
            }

            $product->recommendation_score = $score;
            return $product;
        })->sortByDesc('recommendation_score')->values();

        return $scored->take($limit)->values()->all();
    }

    public function getRecentlyViewed(?int $userId, ?string $visitorId, int $limit = 8): array
    {
        $events = $this->getRecentEvents($userId, $visitorId)
            ->where('event_type', 'view');

        if ($events->isEmpty()) {
            return [];
        }

        $productIds = [];
        foreach ($events as $event) {
            if ($event->product_id && !in_array($event->product_id, $productIds, true)) {
                $productIds[] = $event->product_id;
            }
            if (count($productIds) >= $limit) {
                break;
            }
        }

        return $this->loadProductsByOrder($productIds);
    }

    public function getBecauseViewed(int $productId, ?int $userId, ?string $visitorId, int $limit = 8): array
    {
        $viewerUserIds = UserEvent::query()
            ->where('product_id', $productId)
            ->whereNotNull('user_id')
            ->where('created_at', '>=', now()->subDays(self::CONTEXT_DAYS))
            ->groupBy('user_id')
            ->limit(200)
            ->pluck('user_id')
            ->all();

        if (empty($viewerUserIds)) {
            return $this->getSimilarProducts($productId, $limit);
        }

        $coViewedIds = UserEvent::query()
            ->whereIn('user_id', $viewerUserIds)
            ->where('product_id', '!=', $productId)
            ->whereIn('event_type', ['view', 'wishlist_add', 'cart_add'])
            ->select('product_id', DB::raw('count(*) as cnt'))
            ->groupBy('product_id')
            ->orderByDesc('cnt')
            ->limit($limit * 3)
            ->pluck('product_id')
            ->all();

        if (empty($coViewedIds)) {
            return $this->getSimilarProducts($productId, $limit);
        }

        return $this->loadProductsByOrder($coViewedIds, $limit, [$productId]);
    }

    public function getSimilarProducts(int $productId, int $limit = 8): array
    {
        $product = Product::select('id', 'category_id', 'subcategory_id', 'brand', 'price')
            ->find($productId);

        if (!$product) {
            return [];
        }

        $priceMin = $product->price * 0.7;
        $priceMax = $product->price * 1.3;

        $candidates = Product::query()
            ->where('id', '!=', $productId)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                    ->orWhere('subcategory_id', $product->subcategory_id)
                    ->orWhere('brand', $product->brand);
            })
            ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
            ->limit(160)
            ->get();

        $scored = $candidates->map(function ($candidate) use ($product, $priceMin, $priceMax) {
            $score = 0;
            if ($candidate->subcategory_id && $candidate->subcategory_id === $product->subcategory_id) {
                $score += 4;
            }
            if ($candidate->category_id && $candidate->category_id === $product->category_id) {
                $score += 3;
            }
            if ($candidate->brand && $product->brand && $candidate->brand === $product->brand) {
                $score += 2;
            }
            if ($candidate->price >= $priceMin && $candidate->price <= $priceMax) {
                $score += 1.5;
            }
            $candidate->recommendation_score = $score;
            return $candidate;
        })->sortByDesc('recommendation_score')->values();

        return $scored->take($limit)->values()->all();
    }

    public function getCustomersAlsoBought(int $productId, int $limit = 8): array
    {
        $buyerIds = Order::query()
            ->where('product_id', $productId)
            ->groupBy('user_id')
            ->limit(500)
            ->pluck('user_id')
            ->all();

        if (empty($buyerIds)) {
            return $this->getSimilarProducts($productId, $limit);
        }

        $coBoughtIds = Order::query()
            ->whereIn('user_id', $buyerIds)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('count(*) as cnt'))
            ->groupBy('product_id')
            ->orderByDesc('cnt')
            ->limit($limit * 3)
            ->pluck('product_id')
            ->all();

        return $this->loadProductsByOrder($coBoughtIds, $limit, [$productId]);
    }

    private function getRecentEvents(?int $userId, ?string $visitorId): Collection
    {
        $query = UserEvent::query()
            ->where('created_at', '>=', now()->subDays(self::CONTEXT_DAYS));

        if ($userId && $visitorId) {
            $query->where(function ($q) use ($userId, $visitorId) {
                $q->where('user_id', $userId)->orWhere('visitor_id', $visitorId);
            });
        } elseif ($userId) {
            $query->where('user_id', $userId);
        } elseif ($visitorId) {
            $query->where('visitor_id', $visitorId);
        } else {
            return collect();
        }

        return $query
            ->orderByDesc('created_at')
            ->limit(500)
            ->get();
    }

    private function getCollaborativeCandidates(array $seedProductIds, ?int $userId, int $limit): Collection
    {
        if (empty($seedProductIds)) {
            return collect();
        }

        $similarUserIds = UserEvent::query()
            ->whereIn('product_id', $seedProductIds)
            ->whereNotNull('user_id')
            ->when($userId, function ($query) use ($userId) {
                $query->where('user_id', '!=', $userId);
            })
            ->groupBy('user_id')
            ->orderByRaw('count(*) desc')
            ->limit(100)
            ->pluck('user_id')
            ->all();

        if (empty($similarUserIds)) {
            return collect();
        }

        $productIds = UserEvent::query()
            ->whereIn('user_id', $similarUserIds)
            ->whereIn('event_type', ['purchase', 'cart_add', 'wishlist_add'])
            ->whereNotIn('product_id', $seedProductIds)
            ->select('product_id', DB::raw('count(*) as cnt'))
            ->groupBy('product_id')
            ->orderByDesc('cnt')
            ->limit($limit)
            ->pluck('product_id')
            ->all();

        return Product::query()
            ->whereIn('id', $productIds)
            ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
            ->get();
    }

    private function loadProductsByOrder(array $productIds, int $limit = 8, array $excludeIds = []): array
    {
        if (empty($productIds)) {
            return [];
        }

        $productIds = array_values(array_filter($productIds, function ($id) use ($excludeIds) {
            return !in_array($id, $excludeIds, true);
        }));

        if (empty($productIds)) {
            return [];
        }

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
            ->get()
            ->keyBy('id');

        $ordered = [];
        foreach ($productIds as $productId) {
            if (isset($products[$productId])) {
                $ordered[] = $products[$productId];
            }
            if (count($ordered) >= $limit) {
                break;
            }
        }

        return $ordered;
    }

    private function getFallbackProducts(int $limit): array
    {
        $popularProductIds = Order::query()
            ->select('product_id', DB::raw('count(*) as cnt'))
            ->groupBy('product_id')
            ->orderByDesc('cnt')
            ->limit($limit * 2)
            ->pluck('product_id')
            ->all();

        if (!empty($popularProductIds)) {
            return $this->loadProductsByOrder($popularProductIds, $limit);
        }

        return Product::query()
            ->select('id', 'name', 'description', 'price', 'stock', 'photopath', 'color', 'size', 'category_id', 'brand', 'subcategory_id')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->all();
    }

    private function priceBucket(float $price): string
    {
        if ($price < 20) return 'budget';
        if ($price < 50) return 'value';
        if ($price < 100) return 'mid';
        if ($price < 200) return 'upper';
        return 'premium';
    }

    private function bucketRange(string $bucket): array
    {
        return match ($bucket) {
            'budget' => [0, 19.99],
            'value' => [20, 49.99],
            'mid' => [50, 99.99],
            'upper' => [100, 199.99],
            default => [200, 999999],
        };
    }

    private function buildCacheKey(string $prefix, ?int $userId, ?string $visitorId, int $limit): string
    {
        $userPart = $userId ? "user_{$userId}" : 'user_guest';
        $visitorPart = $visitorId ? "visitor_{$visitorId}" : 'visitor_none';
        return "reco_{$prefix}_{$userPart}_{$visitorPart}_{$limit}";
    }
}

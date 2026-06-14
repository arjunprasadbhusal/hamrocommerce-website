<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserEvent;

class EventLogger
{
    public static function log(
        ?User $user,
        ?string $visitorId,
        string $eventType,
        ?int $productId = null,
        ?int $categoryId = null,
        ?string $brand = null,
        ?float $price = null,
        array $metadata = []
    ): ?UserEvent {
        if (!$user && !$visitorId) {
            return null;
        }

        return UserEvent::create([
            'user_id' => $user?->id,
            'visitor_id' => $visitorId,
            'event_type' => $eventType,
            'product_id' => $productId,
            'category_id' => $categoryId,
            'brand' => $brand,
            'price' => $price,
            'metadata' => $metadata ?: null,
        ]);
    }
}

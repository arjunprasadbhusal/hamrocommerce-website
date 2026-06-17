<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'photopath',
        'color',
        'size',
        'category_id',
        'brand',
        'subcategory_id',
    ];
    
    protected $appends = ['photo_url'];

    public function getDescriptionAttribute($value): ?string
    {
        if ($value === null) {
            return null;
        }

        return trim(html_entity_decode(strip_tags($value), ENT_QUOTES, 'UTF-8'));
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['description'] = $value === null
            ? null
            : trim(html_entity_decode(strip_tags($value), ENT_QUOTES, 'UTF-8'));
    }
    
    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photopath) {
            return null;
        }
        // Use APP_URL from config or request host
        $baseUrl = config('app.url') ?: request()->getSchemeAndHttpHost();
        return $baseUrl . '/storage/' . $this->photopath;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(SubCategory::class);
    }
}

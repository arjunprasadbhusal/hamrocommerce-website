<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Vedio extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'vedio_url',
        'priority',
        'status'
    ];

    protected $appends = ['vedio_full_url'];

    public function getVedioFullUrlAttribute()
    {
        if ($this->vedio_url && Storage::disk('public')->exists($this->vedio_url)) {
            return Storage::url($this->vedio_url);
        }
        return null;
    }
}

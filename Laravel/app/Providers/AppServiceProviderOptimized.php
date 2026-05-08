<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enable query logging only in local environment for debugging
        if (config('app.env') === 'local' && config('app.debug')) {
            DB::listen(function ($query) {
                Log::info('Query executed:', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms'
                ]);
            });
        }

        // Enable response compression
        if (!config('app.debug')) {
            ini_set('zlib.output_compression', 'On');
            ini_set('zlib.output_compression_level', '5');
        }
    }
}

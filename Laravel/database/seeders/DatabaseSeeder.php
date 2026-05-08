<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'dev@bits.com'],
            [
                'name' => 'Developer',
                'role' => 'Admin',
                'phone' => '9848023456',
                'password' => bcrypt('password'),
            ]
        ); 
    }
}

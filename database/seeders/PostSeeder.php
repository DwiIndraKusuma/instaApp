<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Post;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan user admin dengan ID 1 sudah ada
        $adminId = 1;

        // Postingan pertama
        Post::create([
            'user_id' => $adminId,
            'content' => 'Halo, ini postingan pertama admin!',
            'image_url' => 'https://picsum.photos/600/400?random=1',
        ]);

        // Postingan kedua
        Post::create([
            'user_id' => $adminId,
            'content' => 'Ini postingan kedua, tetap santai.',
            'image_url' => 'https://picsum.photos/600/400?random=2',
        ]);
    }
}

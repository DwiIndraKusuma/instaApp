<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // $posts = Post::with('comments', 'user')->latest()->get();
        $posts = Post::with(['comments.user', 'user'])->latest()->get();

        // Format data supaya mudah dipakai di React
        $data = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'user' => $post->user ? $post->user->name : 'Unknown',
                'user_id' => $post->user->id ?? null,
                // 'avatar' => "https://i.pravatar.cc/",
                'avatar' => "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
                'content' => $post->content,
                'image' => asset('storage/' . $post->image_url),
                'likes' => $post->likes_count,
                'liked' => false, // nanti bisa cek user login
                'comments' => $post->comments->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'user' => $c->user ? $c->user->name : 'Unknown',
                        'user_id' => $c->user->id ?? null,
                        'text' => $c->text,
                    ];
                }),

            ];
        });

        return Inertia::render('dashboard', [
            'posts' => $data,
        ]);
    }
}

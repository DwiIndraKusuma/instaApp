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
                'avatar' => "https://i.pravatar.cc/",
                'content' => $post->content,
                'image' => $post->image_url,
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

        \Log::info(json_encode($data));

        return Inertia::render('dashboard', [
            'posts' => $data,
        ]);
    }
}

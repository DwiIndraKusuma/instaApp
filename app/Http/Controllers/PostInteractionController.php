<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PostInteractionController extends Controller
{
    public function like(Request $request, Post $post)
    {
        $user = $request->user();

        try {
            DB::transaction(function () use ($post, $user) {
                // toggle like
                $existing = Like::where('post_id', $post->id)
                    ->where('user_id', $user->id)
                    ->first();

                if ($existing) {
                    $existing->delete();
                } else {
                    Like::create([
                        'post_id' => $post->id,
                        'user_id' => $user->id,
                    ]);
                }
            });

            // Hitung likes terbaru
            $likesCount = $post->likes()->count();

            return response()->json([
                'success' => true,
                'likes' => $likesCount,
                'liked' => $post->likes()->where('user_id', $user->id)->exists()
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function comment(Request $request, Post $post)
    {
        $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $user = $request->user();

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'text' => $request->text,
        ]);

        return response()->json([
            'success' => true,
            'comment' => [
                'id' => $comment->id,
                'user' => $user->name,
                'user_id' => $user->id,
                'text' => $comment->text,
            ]
        ]);
    }

    public function deleteComment($postId, $commentId)
    {
        $comment = Comment::findOrFail($commentId);

        // Pastikan komentar milik user login
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Tidak memiliki akses'], 403);
        }

        $comment->delete();

        return response()->json(['success' => true]);
    }

}

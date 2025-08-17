<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Auth;

class PostInteractionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'image'   => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // max 2MB
        ]);

        $path = null;
        if ($request->hasFile('image')) {
            // Buat nama folder yang aman
            $username = preg_replace('/[^A-Za-z0-9_\-]/', '_', Auth::user()->name);
            $folder = "posts/" . Auth::id() . "-" . $username;

            // Pastikan direktori ada (opsional, store() akan buat otomatis jika tidak ada)
            Storage::disk('public')->makeDirectory($folder);
            // Simpan file ke storage/app/public/posts/{id}-{username}
            $path = $request->file('image')->store($folder, 'public');
        }

        $post = Post::create([
            'user_id'    => Auth::id(),
            'content'    => $validated['content'],
            'image_url'  => $path,
        ]);

        return response()->json([
            'success' => true,
            'post'    => $post->load('user', 'comments'),
        ]);
    }

    public function updateCaption(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $post = Post::findOrFail($id);

        // Pastikan hanya pemilik postingan yang bisa edit
        if ($post->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $post->content = $request->content;
        $post->save();

        return response()->json([
            'success' => true,
            'message' => 'Caption updated successfully.',
            'post' => $post
        ]);
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        // Pastikan hanya pemilik postingan yang bisa hapus
        if ($post->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($post->image_url && Storage::disk('public')->exists($post->image_url)) {
            Storage::disk('public')->delete($post->image_url);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.'
        ]);
    }

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

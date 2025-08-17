<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PostInteractionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/refresh-csrf', function () {
    return response()->json(['token' => csrf_token()]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/post', [PostInteractionController::class, 'store'])->name('posts.store');
    Route::put('/post/{id}/update-caption', [PostInteractionController::class, 'updateCaption'])->name('post.update.caption');
    Route::delete('/post/{id}', [PostInteractionController::class, 'destroy'])->name('post.destroy');

    Route::post('/post/{post}/like', [PostInteractionController::class, 'like'])->name('post.like');
    Route::post('/post/{post}/comment', [PostInteractionController::class, 'comment'])->name('post.comment');
    Route::delete('/post/{post}/comment/{comment}', [PostInteractionController::class, 'deleteComment'])->name('post.deleteComment');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

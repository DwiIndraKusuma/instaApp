import { useState, useEffect } from 'react';
import { Post } from '@/types/dashboard';

export function usePosts(initialPosts: Post[]) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);

    const reloadToken = async () => {
        await fetch('/refresh-csrf')
            .then(res => res.json())
            .then(data => {
                document.querySelector('meta[name="csrf-token"]')
                    ?.setAttribute('content', data.token);
            });
    };

    useEffect(() => {
        reloadToken();
    }, []);

    const createPost = async (caption: string, file: File | null) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const formData = new FormData();
            formData.append('content', caption);
            if (file) formData.append('image', file);

            const res = await fetch('/post', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token!,
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.success) {

                const newPost = {
                    avatar: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
                    comments: [],
                    content: data.post.content,
                    id: data.post.id,
                    image: data.post.image_url ? `${window.location.origin}/storage/${data.post.image_url}` : null,
                    liked: false,
                    likes: 0,
                    user: data.post.user ? data.post.user.name : "Unknown",
                    user_id: data.post.user_id
                };

                setPosts(prev => [newPost, ...prev]);

                return { success: true, message: 'Posting berhasil dibuat.' };
            } else {
                return { success: false, message: data.message || 'Gagal membuat posting.' };
            }
        } catch (error) {
            return { success: false, message: 'Terjadi kesalahan jaringan atau server.' };
        }
    };

    const editPost = async (postId: number, oldCaption: string) => {
        const newCaption = prompt("Edit caption:", oldCaption);
        if (newCaption === null) return;
        if (newCaption.trim() === oldCaption.trim()) return;

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch(`/post/${postId}/update-caption`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token!,
            },
            body: JSON.stringify({ content: newCaption }),
        });
        const data = await res.json();
        if (data.success) {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newCaption } : p));
        }
    };

    const deletePost = async (postId: number) => {
        if (!confirm("Hapus postingan ini?")) return;
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch(`/post/${postId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': token! },
        });
        const data = await res.json();
        if (data.success) {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };

    const toggleLike = async (postId: number) => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch(`/post/${postId}/like`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token! }
        });
        const data = await res.json();
        if (data.success) {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: data.liked, likes: data.likes } : p));
        }
    };

    const addComment = async (postId: number, text: string) => {
        if (!text.trim()) return;
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch(`/post/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token!,
            },
            body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (data.success) {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, data.comment] } : p));
        }
    };

    const deleteComment = async (postId: number, commentId: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch(`/post/${postId}/comment/${commentId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': token! }
        });
        const data = await res.json();
        if (data.success) {
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
                    : p
            ));
        }
    };

    return {
        posts,
        setPosts,
        createPost,
        editPost,
        deletePost,
        toggleLike,
        addComment,
        deleteComment,
    };
}

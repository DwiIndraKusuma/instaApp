import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PageProps, Post } from '@/types/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    // Ambil data posts dari props Inertia
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { posts: initialPosts } = usePage<PageProps<{ posts: Post[] }>>().props;
    const [posts, setPosts] = useState(initialPosts);

    const toggleLike = async (postId: number) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/post/${postId}/like`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': token! }
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev?.map(p => p.id === postId ? { ...p, liked: data.liked, likes: data.likes } : p));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addComment = async (postId: number, text: string) => {
        if (!text.trim()) return;
        try {
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
                setPosts(prev => prev?.map(p => p.id === postId ? { ...p, comments: [...p.comments, data.comment] } : p));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteComment = async (postId: number, commentId: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/post/${postId}/comment/${commentId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': token! }
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev =>
                    prev?.map(p =>
                        p.id === postId
                            ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
                            : p
                    )
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const reloadToken = async () => {
        await fetch('/refresh-csrf')
            .then(res => res.json())
            .then(data => {
                document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', data.token);
            });
    }

    useEffect(() => {
        reloadToken()
    }, [])


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
                {/* Form posting baru */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                    <textarea
                        placeholder="Tulis sesuatu..."
                        className="w-full rounded border border-gray-300 dark:border-gray-600 p-2 mb-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                        rows={3}
                    />
                    <div className="flex justify-between items-center">
                        <input type="file" className="text-sm" />
                        <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                            Post
                        </button>
                    </div>
                </div>

                {/* Feed */}
                {posts?.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center p-4 gap-2">
                            <img src={post.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{post.user}</span>
                        </div>

                        {/* Content */}
                        {post.image && <img src={post.image} alt="post" className="w-full aspect-video object-cover" />}
                        {post.content && <div className="px-4 pb-2 mt-2 text-gray-900 dark:text-gray-100">{post.content}</div>}

                        {/* Actions */}
                        <div className="flex items-center gap-4 px-4 py-2">
                            <button
                                className={`font-semibold ${post.liked ? 'text-red-500' : 'text-gray-500'}`}
                                onClick={() => toggleLike(post.id)}
                            >
                                ❤️ {post.likes}
                            </button>
                        </div>

                        {/* Comments */}
                        <div className="px-4 pb-4 space-y-1">
                            {post.comments.map((c) => (
                                <div key={c.id} className="flex justify-between items-center text-sm">
                                    <span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{c.user}</span>: {c.text}
                                    </span>
                                    {c.user_id === auth.user.id && (
                                        <button
                                            className="text-red-500 text-xs ml-2"
                                            onClick={() => deleteComment(post.id, c.id)}
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Form komentar */}
                            <CommentForm onSubmit={(text) => addComment(post.id, text)} />
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}

// Komponen form komentar
function CommentForm({ onSubmit }: { onSubmit: (text: string) => void }) {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
                type="text"
                className="flex-1 rounded border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="Tambahkan komentar..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button className="text-blue-500 font-semibold text-sm" type="submit">
                Kirim
            </button>
        </form>
    );
}

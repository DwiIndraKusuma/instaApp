import { useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PageProps, Post } from '@/types/dashboard';

import { AlertCircleIcon, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import PostActionMenu from '@/components/post-action-menu';
import { usePosts } from '@/hooks/use-post';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    // Ambil data posts dari props Inertia
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { posts: initialPosts } = usePage<PageProps<{ posts: Post[] }>>().props;

    const [caption, setCaption] = useState('');
    const [errorPosting, setErrorPosting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const {
        posts,
        createPost,
        editPost,
        deletePost,
        toggleLike,
        addComment,
        deleteComment
    } = usePosts(initialPosts ?? []);

    const handleCreate = async () => {
        if (!caption.trim() || !file) {
            setErrorPosting(true)
            return;
        }

        const result = await createPost(caption, file);

        if (result.success) {
            setErrorPosting(false)
            setCaption('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            setErrorPosting(true)
            return;
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>


            <Head title="Dashboard" />


            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
                <div style={{ display: !errorPosting ? 'none' : '' }}>
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>Posting gagal dilakukan.</AlertTitle>
                        <AlertDescription>
                            <p>Pastikan data yang dimasukkan sudah sesuai.</p>
                        </AlertDescription>
                        <button
                            type="button"
                            onClick={() => setErrorPosting(false)}
                            className="absolute top-2 right-2 text-red-800 hover:text-red-600"
                        >
                            <X size={16} />
                        </button>
                    </Alert>
                </div>

                {/* Form posting baru */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                    <textarea
                        placeholder="Tulis sesuatu..."
                        className="w-full rounded border border-gray-300 dark:border-gray-600 p-2 mb-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                        rows={3}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        required
                    />
                    <div className="flex justify-between items-center">
                        <input
                            type="file"
                            accept="image/*"
                            className="text-sm"
                            required
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                        >
                            Post
                        </button>
                    </div>
                    <small className="block text-gray-500 mt-1">*Max: 2MB</small>

                </div>

                {/* Feed */}
                {posts?.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 gap-2">
                            <div className="flex items-center gap-2">
                                <img src={post.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{post.user}</span>
                            </div>

                            {post.user_id === auth.user.id && (
                                <PostActionMenu
                                    onEdit={() => editPost(post.id, post.content)}
                                    onDelete={() => deletePost(post.id)}
                                />
                            )}
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
        </AppLayout >
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

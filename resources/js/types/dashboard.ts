export interface Comment {
    id: number;
    user: string;
    user_id: number | null;
    text: string;
}

export interface Post {
    id: number;
    user: string;
    user_id: number | null;
    avatar?: string;
    content: string;
    image: string | null;
    likes: number;
    liked: boolean;
    comments: Comment[];
}

export interface PageProps<T = {}> {
    auth?: {
        user: {
            id: number;
            username: string;
            avatar_url?: string;
        };
    };
    flash?: {
        message?: string;
    };
    posts?: Post[];
    [key: string]: any; // untuk props lain yang dikirim dari controller
}

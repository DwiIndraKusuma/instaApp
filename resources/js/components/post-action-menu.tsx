import { useState, useRef, useEffect } from 'react';

interface PostActionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function PostActionMenu({ onEdit, onDelete }: PostActionMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Bersihkan event listener saat komponen unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                ⋮
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded shadow-lg z-10">
                    <button
                        onClick={() => { setOpen(false); onEdit(); }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Edit Caption
                    </button>
                    <button
                        onClick={() => { setOpen(false); onDelete(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Hapus Post
                    </button>
                </div>
            )}
        </div>
    );
}

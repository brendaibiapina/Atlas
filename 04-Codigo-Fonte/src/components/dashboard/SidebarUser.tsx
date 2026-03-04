'use client';

import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function SidebarUser() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('');
    const [userInitials, setUserInitials] = useState('');

    const supabase =
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            )
            : null;

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && user.email) {
                setUserEmail(user.email);
                // Generate initials from email prefix
                const prefix = user.email.split('@')[0];
                const parts = prefix.split(/[._-]/);
                const initials = parts.length >= 2
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : prefix.substring(0, 2).toUpperCase();
                setUserInitials(initials);
            }
        });
    }, [supabase]);

    const handleLogout = async () => {
        if (!supabase) {
            router.push('/login');
            return;
        }
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {userInitials || '..'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userEmail || 'Carregando...'}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Sair"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    );
}

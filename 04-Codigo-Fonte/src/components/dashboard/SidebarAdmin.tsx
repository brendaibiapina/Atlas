'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { isAdminEmail } from '@/lib/admin';

export function SidebarAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return;
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (isAdminEmail(user?.email)) {
                setIsAdmin(true);
            }
        });
    }, []);

    if (!isAdmin) return null;

    return (
        <div className="pt-4 mt-6 border-t border-gray-100">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gestão</p>
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <ShieldCheck size={18} />
                Admin
            </Link>
        </div>
    );
}

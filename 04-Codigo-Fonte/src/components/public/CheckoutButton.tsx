'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
    email?: string;
    perfil?: string;
    children: React.ReactNode;
    className?: string;
}

export function CheckoutButton({ email, perfil, children, className = '' }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (email?.trim()) params.set('email', email.trim());
        if (perfil?.trim()) params.set('perfil', perfil.trim());
        const target = params.toString() ? `/inscricao?${params.toString()}` : '/inscricao';
        router.push(target);
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`${className} disabled:opacity-60 disabled:cursor-wait`}
        >
            {loading ? (
                <span className="flex items-center gap-2 justify-center">
                    <Loader2 size={16} className="animate-spin" />
                    Redirecionando...
                </span>
            ) : (
                children
            )}
        </button>
    );
}

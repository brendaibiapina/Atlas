'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    status: string;
    className?: string;
    children?: React.ReactNode;
    dot?: boolean;
}

const statusStyles: Record<string, { bg: string; dot: string }> = {
    'VIGENTE': { bg: 'bg-white text-atlas-verdant border-atlas-verdant/35', dot: 'bg-atlas-verdant' },
    'EM_CONSTRUCAO': { bg: 'bg-white text-atlas-gold-dark border-atlas-gold/35', dot: 'bg-atlas-gold' },
    'FUTURO': { bg: 'bg-white text-atlas-petrol-deep border-atlas-petrol/35', dot: 'bg-atlas-petrol' },
    'PENDING': { bg: 'bg-white text-atlas-petrol-deep border-atlas-petrol/35', dot: 'bg-atlas-petrol' },
    'EDUCATIVO': { bg: 'bg-white text-atlas-verdant border-atlas-verdant/35', dot: 'bg-atlas-verdant' },
    'COMPLETED': { bg: 'bg-white text-atlas-verdant border-atlas-verdant/35', dot: 'bg-atlas-verdant' },
    'CURRENT': { bg: 'bg-white text-atlas-gold-dark border-atlas-gold/35', dot: 'bg-atlas-gold' },
};

export function Badge({ status, className, children, dot = true }: BadgeProps) {
    const normalizedStatus = status.toString();
    const style = statusStyles[normalizedStatus] || { bg: 'bg-white text-atlas-petrol-deep border-atlas-petrol/35', dot: 'bg-atlas-petrol' };

    const content = children || normalizedStatus.replace(/_/g, ' ');

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
            style.bg,
            className
        )}>
            {dot && (
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", style.dot)} />
            )}
            {content}
        </span>
    );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'glass' | 'gold' | 'dark';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
}

export function Card({ className, children, variant = 'default', ...props }: CardProps) {
    const variants = {
        default: 'bg-white/96 border border-atlas-petrol/22 shadow-sm hover:shadow-md hover:border-atlas-petrol/35 transition-all duration-300',
        glass: 'bg-white/88 backdrop-blur-md border border-atlas-petrol/22 shadow-sm hover:shadow-md hover:border-atlas-petrol/35 transition-all duration-300',
        gold: 'bg-white/95 border border-atlas-gold/25 shadow-sm hover:shadow-atlas-gold transition-all duration-300',
        dark: 'bg-atlas-petrol-deep/92 backdrop-blur-md border border-white/[0.08] text-white shadow-md',
    };

    return (
        <div
            className={cn("rounded-xl", variants[variant], className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-sm font-bold text-atlas-petrol-deep tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("px-5 pb-5", className)} {...props} />;
}

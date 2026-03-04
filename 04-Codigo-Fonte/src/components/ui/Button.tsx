'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
    const variants = {
        primary: 'bg-atlas-petrol text-white hover:bg-atlas-petrol-deep shadow-sm hover:shadow-md',
        secondary: 'bg-gradient-to-r from-atlas-gold to-atlas-gold-light text-atlas-graphite font-bold hover:shadow-atlas-gold',
        outline: 'border border-atlas-petrol/30 bg-white/95 text-atlas-petrol-deep hover:bg-atlas-petrol/[0.1] hover:border-atlas-petrol/45 hover:shadow-sm',
        ghost: 'bg-transparent text-atlas-petrol/82 hover:text-atlas-petrol-deep hover:bg-atlas-petrol/[0.14]',
        gold: 'bg-gradient-to-r from-atlas-gold to-atlas-gold-light text-atlas-graphite font-bold shadow-atlas-gold hover:shadow-atlas-glow hover:scale-[1.02] transition-all duration-200',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1',
        md: 'px-5 py-2.5 text-sm rounded-xl gap-1.5',
        lg: 'px-7 py-3 text-base rounded-xl gap-2',
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-atlas-gold/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}

export function FilterButton({ active, ...props }: ButtonProps & { active?: boolean }) {
    return (
        <Button
            variant={active ? 'primary' : 'outline'}
            size="sm"
            className={cn(active && 'bg-atlas-petrol text-white border-atlas-petrol shadow-sm')}
            {...props}
        />
    );
}

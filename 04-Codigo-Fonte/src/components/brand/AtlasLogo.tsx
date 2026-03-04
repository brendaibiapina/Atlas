import Image from 'next/image';
import { cn } from '@/lib/utils';

type AtlasLogoProps = {
    variant?: 'full' | 'fullCompact' | 'mark';
    className?: string;
    priority?: boolean;
};

const dimensions = {
    full: { width: 196, height: 48, src: '/atlas-logo.svg', alt: 'Atlas' },
    fullCompact: { width: 156, height: 38, src: '/atlas-logo.svg', alt: 'Atlas' },
    mark: { width: 32, height: 32, src: '/atlas-mark.svg', alt: 'Atlas marca' },
};

export function AtlasLogo({ variant = 'full', className, priority = false }: AtlasLogoProps) {
    const config = dimensions[variant];

    return (
        <Image
            src={config.src}
            alt={config.alt}
            width={config.width}
            height={config.height}
            priority={priority}
            className={cn('h-auto w-auto select-none', className)}
        />
    );
}

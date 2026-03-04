'use client';

import React from 'react';
import Link from 'next/link';
import { AtlasLogo } from '@/components/brand/AtlasLogo';

export function Header() {
    return (
        <header className="fixed w-full bg-white/85 backdrop-blur-xl border-b border-atlas-petrol/10 z-50">
            <div className="w-full px-8 md:px-12 lg:px-16 h-16 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-2.5 py-0.5 focus-visible:outline-none">
                    <AtlasLogo variant="fullCompact" className="h-6 md:h-7 w-auto" priority />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.14em] text-atlas-gold-dark whitespace-nowrap group-hover:text-atlas-gold transition-colors">
                        Reforma Tributária
                    </span>
                </Link>

                <nav className="hidden md:flex gap-8">
                    <Link href="/sobre" className="text-sm font-semibold text-slate-600 hover:text-atlas-petrol-deep transition-colors">Sobre</Link>
                    <Link href="/preco" className="text-sm font-semibold text-slate-600 hover:text-atlas-petrol-deep transition-colors">Preço</Link>
                    <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-atlas-petrol-deep transition-colors">Login</Link>
                </nav>

                <div className="flex gap-3 items-center">
                    <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-atlas-petrol-deep hidden md:block transition-colors">
                        Entrar
                    </Link>
                    <Link href="/inscricao" className="bg-atlas-petrol-deep text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:bg-atlas-petrol transition-all duration-200">
                        Começar Agora
                    </Link>
                </div>
            </div>
        </header>
    );
}

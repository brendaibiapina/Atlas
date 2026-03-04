import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
    title: 'Atlas da Reforma Tributária',
    description: 'Sua bússola segura na Reforma Tributária.',
    icons: {
        icon: '/atlas-mark.svg',
        shortcut: '/atlas-mark.svg',
        apple: '/atlas-mark.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.variable} ${playfair.variable} font-sans`}>{children}</body>
        </html>
    );
}

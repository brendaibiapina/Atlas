import { NextRequest, NextResponse } from 'next/server';
import { stripe, ATLAS_PRICE_BRL, ATLAS_PRODUCT_NAME } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, perfil, nome } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório' },
                { status: 400 }
            );
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
        if (!isValidEmail) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        const metadata: Record<string, string> = {
            perfil: perfil || 'geral',
        };

        if (nome && typeof nome === 'string') {
            metadata.nome = nome.trim().slice(0, 120);
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: ATLAS_PRODUCT_NAME,
                            description: 'Pagamento único. Acesso vitalício ao painel de monitoramento da Reforma Tributária.',
                        },
                        unit_amount: ATLAS_PRICE_BRL,
                    },
                    quantity: 1,
                },
            ],
            metadata,
            success_url: `${request.nextUrl.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/preco`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao criar sessão de pagamento' },
            { status: 500 }
        );
    }
}

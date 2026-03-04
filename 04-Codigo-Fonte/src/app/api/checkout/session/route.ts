import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
        return NextResponse.json({ error: 'session_id é obrigatório' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json({
            id: session.id,
            mode: session.mode,
            payment_status: session.payment_status,
            customer_email: session.customer_email,
            paid: session.payment_status === 'paid',
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Sessão de checkout não encontrada' },
            { status: 404 }
        );
    }
}

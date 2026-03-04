import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Supabase Admin client (service role) for user creation
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey || serviceKey.includes('SUA_SERVICE_ROLE_KEY_AQUI')) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local');
    }

    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

async function upsertAlertPreference(supabase: any, userId: string) {
    const { error } = await supabase.from('user_alert_preferences').upsert(
        {
            user_id: userId,
            email_enabled: true,
            alert_frequency: 'IMMEDIATE',
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
    );

    // A tabela pode não existir em ambientes ainda não migrados.
    if (error && error.code !== '42P01') {
        console.error('Falha ao atualizar preferências de alerta:', error.message);
    }
}

async function findUserByEmail(supabase: any, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const perPage = 200;
    let page = 1;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) throw error;

        const users = data?.users || [];
        const found = users.find((user: any) => user.email?.trim().toLowerCase() === normalizedEmail);
        if (found) return found;

        if (users.length < perPage) return null;
        page += 1;
    }
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!webhookSecret || webhookSecret.includes('SUA_WEBHOOK_SECRET_AQUI')) {
        return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET não configurada no .env.local' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const email = session.customer_email;
        const perfil = session.metadata?.perfil || 'geral';
        const stripeCustomerId = session.customer as string;
        const paymentIntentId = session.payment_intent as string;

        if (!email) {
            console.error('No email in checkout session');
            return NextResponse.json({ error: 'No email' }, { status: 400 });
        }

        console.log(`Pagamento confirmado: ${email} (${perfil})`);

        try {
            const supabase = getSupabaseAdmin();

            // Check if user already exists with paginated lookup
            const userExists = await findUserByEmail(supabase, email);

            if (!userExists) {
                // Create new user, Supabase will send a "set password" email
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: {
                        perfil,
                        stripe_customer_id: stripeCustomerId,
                        payment_intent_id: paymentIntentId,
                        plano: 'vitalicio',
                        data_compra: new Date().toISOString(),
                    },
                });

                if (createError) {
                    console.error('Error creating user:', createError);
                    return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
                }

                console.log(`Usuario criado: ${newUser.user.id} (${email})`);

                await upsertAlertPreference(supabase, newUser.user.id);

                // Send password reset email so user can set their password
                const { error: linkError } = await supabase.auth.admin.generateLink({
                    type: 'recovery',
                    email,
                });

                if (linkError) {
                    console.error('Erro ao gerar link de recovery:', linkError.message);
                }
            } else {
                console.log(`Usuario ja existe: ${userExists.id} (${email})`);

                if (userExists.user_metadata?.payment_intent_id === paymentIntentId) {
                    await upsertAlertPreference(supabase, userExists.id);
                    return NextResponse.json({ received: true, duplicated: true });
                }

                // Update metadata with payment info
                await supabase.auth.admin.updateUserById(userExists.id, {
                    user_metadata: {
                        ...userExists.user_metadata,
                        stripe_customer_id: stripeCustomerId,
                        payment_intent_id: paymentIntentId,
                        plano: 'vitalicio',
                        data_compra: new Date().toISOString(),
                    },
                });

                await upsertAlertPreference(supabase, userExists.id);
            }
        } catch (err) {
            console.error('Supabase error:', err);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

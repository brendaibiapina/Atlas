import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurada no .env.local');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
});

// Preço do Atlas (em centavos)
export const ATLAS_PRICE_BRL = 8990; // R$ 89,90
export const ATLAS_PRODUCT_NAME = 'Atlas da Reforma Tributária, Acesso Vitalício';

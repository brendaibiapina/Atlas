#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env.local');
const DEFAULT_PORT = 3010;

function parseArgs(argv) {
    const args = {};

    for (let i = 2; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith('--')) continue;

        const raw = token.slice(2);
        if (raw.includes('=')) {
            const [k, v] = raw.split('=');
            args[k] = v;
            continue;
        }

        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
            args[raw] = next;
            i += 1;
        } else {
            args[raw] = true;
        }
    }

    return args;
}

function parseEnvFile(raw) {
    const env = {};
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = line.indexOf('=');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        env[key] = value;
    }
    return env;
}

function setEnvValue(raw, key, value) {
    const escaped = String(value ?? '').replace(/\r?\n/g, '');
    const lineRegex = new RegExp(`^${key}=.*$`, 'm');

    if (lineRegex.test(raw)) {
        return raw.replace(lineRegex, `${key}=${escaped}`);
    }

    const suffix = raw.endsWith('\n') ? '' : '\n';
    return `${raw}${suffix}${key}=${escaped}\n`;
}

function saveEnvFileWithBackup(filePath, updater) {
    const original = fs.readFileSync(filePath, 'utf8');
    const next = updater(original);

    if (next === original) return false;

    const backupPath = `${filePath}.bak-${Date.now()}`;
    fs.writeFileSync(backupPath, original, 'utf8');
    fs.writeFileSync(filePath, next, 'utf8');
    return true;
}

function isPlaceholderValue(key, value) {
    if (!value) return true;
    const current = value.trim();
    if (!current) return true;
    if (current.includes('SUA_') || current.includes('_AQUI')) return true;

    if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        const ok = current.startsWith('sb_secret_') || current.startsWith('eyJ');
        return !ok;
    }

    if (key === 'STRIPE_WEBHOOK_SECRET') {
        return !current.startsWith('whsec_');
    }

    return false;
}

function runCommand(cmd, args, options = {}) {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, {
            cwd: ROOT,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
            ...options,
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += String(chunk);
        });

        child.stderr.on('data', (chunk) => {
            stderr += String(chunk);
        });

        child.on('close', (code) => {
            resolve({ code: code ?? 1, stdout, stderr });
        });
    });
}

async function waitForServer(baseUrl, timeoutMs = 35000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const response = await fetch(`${baseUrl}/login`, { method: 'GET' });
            if (response.ok) return true;
        } catch {
            // ignore and retry
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
    }

    return false;
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    let json;

    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        json = null;
    }

    return {
        ok: response.ok,
        status: response.status,
        body: json,
        raw: text,
    };
}

function signStripePayload(payload, webhookSecret) {
    const ts = Math.floor(Date.now() / 1000);
    const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${ts}.${payload}`, 'utf8')
        .digest('hex');

    return `t=${ts},v1=${signature}`;
}

function extractCheckoutSessionId(url) {
    if (!url) return null;
    const match = String(url).match(/cs_(?:test|live)_[A-Za-z0-9_]+/);
    return match ? match[0] : null;
}

function printStep(step) {
    const icon = step.ok ? 'OK' : 'FAIL';
    const line = `[${icon}] ${step.name} - ${step.detail}`;
    console.log(line);
}

async function main() {
    const args = parseArgs(process.argv);
    const serviceRoleArg = args['service-role-key'];
    const webhookSecretArg = args['webhook-secret'];
    const skipBuild = Boolean(args['skip-build']);
    const port = Number(args.port || DEFAULT_PORT);
    const baseUrl = `http://127.0.0.1:${port}`;

    if (!fs.existsSync(ENV_PATH)) {
        console.error(`[FAIL] .env.local não encontrado em ${ENV_PATH}`);
        process.exit(1);
    }

    if (serviceRoleArg || webhookSecretArg) {
        saveEnvFileWithBackup(ENV_PATH, (raw) => {
            let next = raw;
            if (serviceRoleArg) next = setEnvValue(next, 'SUPABASE_SERVICE_ROLE_KEY', serviceRoleArg);
            if (webhookSecretArg) next = setEnvValue(next, 'STRIPE_WEBHOOK_SECRET', webhookSecretArg);
            return next;
        });
    }

    const envRaw = fs.readFileSync(ENV_PATH, 'utf8');
    const env = parseEnvFile(envRaw);

    const requiredKeys = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
    ];

    const steps = [];

    const missingOrInvalid = requiredKeys.filter((key) => isPlaceholderValue(key, env[key]));
    steps.push({
        name: 'Configuração de chaves',
        ok: missingOrInvalid.length === 0,
        detail: missingOrInvalid.length === 0
            ? 'Todas as chaves obrigatórias estão válidas'
            : `Chaves ausentes ou placeholder: ${missingOrInvalid.join(', ')}`,
    });

    if (missingOrInvalid.length > 0) {
        steps.forEach(printStep);
        process.exit(1);
    }

    if (!skipBuild) {
        const build = await runCommand('npm', ['run', 'build']);
        steps.push({
            name: 'Build de produção',
            ok: build.code === 0,
            detail: build.code === 0 ? 'Build concluída com sucesso' : `Build falhou com código ${build.code}`,
        });

        if (build.code !== 0) {
            steps.forEach(printStep);
            console.error(build.stdout || build.stderr);
            process.exit(1);
        }
    }

    const server = spawn('npm', ['run', 'start', '--', '-p', String(port), '-H', '127.0.0.1'], {
        cwd: ROOT,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let serverLogs = '';
    server.stdout.on('data', (chunk) => {
        serverLogs += String(chunk);
    });
    server.stderr.on('data', (chunk) => {
        serverLogs += String(chunk);
    });

    try {
        const ready = await waitForServer(baseUrl, 40000);
        steps.push({
            name: 'Inicialização do servidor',
            ok: ready,
            detail: ready ? `Servidor pronto em ${baseUrl}` : 'Servidor não ficou pronto no tempo esperado',
        });

        if (!ready) {
            steps.forEach(printStep);
            console.error(serverLogs);
            process.exit(1);
        }

        const signupPage = await requestJson(`${baseUrl}/inscricao`, { method: 'GET' });
        steps.push({
            name: 'Página de inscrição',
            ok: signupPage.status === 200,
            detail: `GET /inscricao retornou ${signupPage.status}`,
        });

        const badCheckout = await requestJson(`${baseUrl}/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        steps.push({
            name: 'Validação de checkout sem email',
            ok: badCheckout.status === 400,
            detail: `POST /api/checkout sem email retornou ${badCheckout.status}`,
        });

        const testEmail = `qa.payment.${Date.now()}@example.com`;
        const checkout = await requestJson(`${baseUrl}/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: 'QA Payment',
                email: testEmail,
                perfil: 'geral',
            }),
        });

        const checkoutUrl = checkout.body?.url;
        const sessionId = extractCheckoutSessionId(checkoutUrl);

        steps.push({
            name: 'Criação de sessão no Stripe',
            ok: checkout.status === 200 && Boolean(checkoutUrl) && Boolean(sessionId),
            detail: checkout.status === 200 && checkoutUrl
                ? `Sessão criada (${sessionId || 'sem ID extraído'})`
                : `Falha ao criar sessão, status ${checkout.status}`,
        });

        if (!sessionId) {
            steps.forEach(printStep);
            process.exit(1);
        }

        const sessionCheck = await requestJson(
            `${baseUrl}/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
            { method: 'GET' }
        );
        steps.push({
            name: 'Consulta da sessão de checkout',
            ok: sessionCheck.status === 200 && sessionCheck.body?.id === sessionId,
            detail: `GET /api/checkout/session retornou ${sessionCheck.status}`,
        });

        const webhookEmail = `qa.webhook.${Date.now()}@example.com`;
        const webhookPayloadObject = {
            id: `evt_payment_check_${Date.now()}`,
            object: 'event',
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: `cs_payment_check_${Date.now()}`,
                    object: 'checkout.session',
                    customer_email: webhookEmail,
                    metadata: { perfil: 'geral' },
                    customer: `cus_payment_check_${Date.now()}`,
                    payment_intent: `pi_payment_check_${Date.now()}`,
                },
            },
        };

        const webhookPayload = JSON.stringify(webhookPayloadObject);
        const stripeSignature = signStripePayload(webhookPayload, env.STRIPE_WEBHOOK_SECRET);

        const webhookCall = await requestJson(`${baseUrl}/api/webhook/stripe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': stripeSignature,
            },
            body: webhookPayload,
        });

        steps.push({
            name: 'Webhook de confirmação',
            ok: webhookCall.status === 200 && webhookCall.body?.received === true,
            detail: `POST /api/webhook/stripe retornou ${webhookCall.status}`,
        });
    } finally {
        try {
            process.kill(server.pid, 'SIGTERM');
        } catch {
            // ignore
        }
    }

    const failed = steps.filter((step) => !step.ok);
    steps.forEach(printStep);

    if (failed.length > 0) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(`[FAIL] Erro inesperado: ${error?.message || String(error)}`);
    process.exit(1);
});

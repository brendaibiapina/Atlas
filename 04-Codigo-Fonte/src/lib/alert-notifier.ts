import { createClient } from '@supabase/supabase-js';

type AlertType = 'ATUALIZACAO' | 'OBRIGACAO';

type AlertPayload = {
    type: AlertType;
    title: string;
    summary: string;
    sourceUrl?: string | null;
    sourceLabel?: string | null;
    dashboardUrl: string;
    referenceTitle?: string | null;
};

export type AlertDispatchResult = {
    status: 'sent' | 'partial' | 'failed' | 'skipped';
    recipients: number;
    sent: number;
    failed: number;
    reason?: string;
};

type AlertPreferenceRow = {
    user_id: string;
    email_enabled: boolean | null;
    alert_frequency: string | null;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRole || serviceRole === 'SUA_SERVICE_ROLE_KEY_AQUI') {
        return null;
    }

    return createClient(url, serviceRole, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

function getResendConfig() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.ALERT_FROM_EMAIL;

    if (!apiKey || !from) return null;
    return { apiKey, from };
}

function normalizeEmail(value: string | null | undefined): string | null {
    if (!value) return null;
    const email = value.trim().toLowerCase();
    return email.length > 0 ? email : null;
}

function buildSubject(payload: AlertPayload): string {
    if (payload.type === 'ATUALIZACAO') {
        return `Atlas | Nova atualização oficial: ${payload.title}`;
    }
    return `Atlas | Nova obrigação no sistema: ${payload.title}`;
}

function buildHtml(payload: AlertPayload): string {
    const badge = payload.type === 'ATUALIZACAO' ? 'ATUALIZAÇÃO OFICIAL' : 'NOVA OBRIGAÇÃO';
    const sourceLabel = payload.sourceLabel ? escapeHtml(payload.sourceLabel) : 'ATLAS';
    const referenceBlock = payload.referenceTitle
        ? `<p style="margin: 0 0 14px 0; color: #4b5563; font-size: 14px;"><strong>Base de referência:</strong> ${escapeHtml(payload.referenceTitle)}</p>`
        : '';

    const sourceButton = payload.sourceUrl
        ? `<a href="${escapeHtml(payload.sourceUrl)}" style="display: inline-block; margin-right: 8px; margin-top: 8px; background: #1f6c75; color: #ffffff; text-decoration: none; font-weight: 700; padding: 10px 14px; border-radius: 10px; font-size: 13px;">Ver fonte oficial</a>`
        : '';

    return `
      <div style="font-family: Inter, Arial, sans-serif; color: #1f2937; max-width: 620px; margin: 0 auto; border: 1px solid #dbe4f0; border-radius: 14px; overflow: hidden; background: #ffffff;">
        <div style="padding: 22px; background: linear-gradient(135deg, #174f58, #1f6c75);">
          <span style="display: inline-block; background: #d4b06c; color: #5b430f; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.03em;">${badge}</span>
          <h2 style="margin: 12px 0 4px 0; color: #ffffff; font-size: 22px; line-height: 1.3;">${escapeHtml(payload.title)}</h2>
          <p style="margin: 0; color: #d8e3ef; font-size: 13px;">Origem: ${sourceLabel}</p>
        </div>
        <div style="padding: 20px 22px;">
          <p style="margin: 0 0 14px 0; color: #334155; line-height: 1.6; font-size: 15px;">${escapeHtml(payload.summary)}</p>
          ${referenceBlock}
          <div style="margin-top: 10px;">
            ${sourceButton}
            <a href="${escapeHtml(payload.dashboardUrl)}" style="display: inline-block; margin-top: 8px; background: #f7f3e9; color: #1f6c75; text-decoration: none; font-weight: 700; padding: 10px 14px; border-radius: 10px; font-size: 13px; border: 1px solid #d9c89f;">Abrir painel Atlas</a>
          </div>
        </div>
      </div>
    `;
}

async function fetchAlertPreferences(admin: any, userIds: string[]) {
    const preferenceByUserId = new Map<string, AlertPreferenceRow>();

    if (userIds.length === 0) return preferenceByUserId;

    const client = admin as any;
    const { data, error } = await client
        .from('user_alert_preferences')
        .select('user_id, email_enabled, alert_frequency')
        .in('user_id', userIds);

    // Tabela opcional: se não existir, segue envio para todos os usuários.
    if (error && error.code !== '42P01') {
        console.error('Erro ao buscar preferências de alerta:', error.message);
        return preferenceByUserId;
    }

    (data ?? []).forEach((row: AlertPreferenceRow) => {
        preferenceByUserId.set(row.user_id, row);
    });

    return preferenceByUserId;
}

async function listRecipientEmails() {
    const admin = getSupabaseAdmin();
    if (!admin) {
        return { emails: [] as string[], error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' };
    }

    const allUsers: { id: string; email: string }[] = [];
    const perPage = 200;
    let page = 1;

    while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) {
            return { emails: [] as string[], error: error.message };
        }

        const users = data?.users ?? [];
        users.forEach((user) => {
            const email = normalizeEmail(user.email);
            if (!email) return;
            if (!user.email_confirmed_at) return;
            allUsers.push({ id: user.id, email });
        });

        if (users.length < perPage) break;
        page += 1;
    }

    const preferences = await fetchAlertPreferences(
        admin,
        allUsers.map((user) => user.id)
    );

    const enabledEmails = allUsers
        .filter((user) => {
            const pref = preferences.get(user.id);
            if (!pref) return true;
            const emailEnabled = pref.email_enabled !== false;
            const immediateOrUnset = !pref.alert_frequency || pref.alert_frequency === 'IMMEDIATE';
            return emailEnabled && immediateOrUnset;
        })
        .map((user) => user.email);

    const uniqueEmails = Array.from(new Set(enabledEmails));
    return { emails: uniqueEmails, error: null as string | null };
}

async function sendEmail(to: string, subject: string, html: string) {
    const resend = getResendConfig();
    if (!resend) {
        return { ok: false, error: 'RESEND_API_KEY ou ALERT_FROM_EMAIL não configurado' };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${resend.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: resend.from,
            to: [to],
            subject,
            html,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: text || `HTTP ${response.status}` };
    }

    return { ok: true as const };
}

export async function dispatchAlertEmail(payload: AlertPayload): Promise<AlertDispatchResult> {
    const resend = getResendConfig();
    if (!resend) {
        return {
            status: 'skipped',
            recipients: 0,
            sent: 0,
            failed: 0,
            reason: 'Serviço de email não configurado',
        };
    }

    const recipients = await listRecipientEmails();
    if (recipients.error) {
        return {
            status: 'failed',
            recipients: 0,
            sent: 0,
            failed: 0,
            reason: recipients.error,
        };
    }

    if (recipients.emails.length === 0) {
        return {
            status: 'skipped',
            recipients: 0,
            sent: 0,
            failed: 0,
            reason: 'Sem usuários elegíveis para notificação',
        };
    }

    const subject = buildSubject(payload);
    const html = buildHtml(payload);
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.emails.length; i += 10) {
        const batch = recipients.emails.slice(i, i + 10);
        const result = await Promise.allSettled(
            batch.map(async (email) => {
                const response = await sendEmail(email, subject, html);
                if (!response.ok) {
                    throw new Error(response.error);
                }
            })
        );

        result.forEach((item) => {
            if (item.status === 'fulfilled') {
                sent += 1;
            } else {
                failed += 1;
                console.error('Falha no envio de alerta por email:', item.reason);
            }
        });
    }

    if (failed === 0) {
        return { status: 'sent', recipients: recipients.emails.length, sent, failed };
    }
    if (sent > 0) {
        return { status: 'partial', recipients: recipients.emails.length, sent, failed };
    }
    return {
        status: 'failed',
        recipients: recipients.emails.length,
        sent,
        failed,
        reason: 'Todos os envios falharam',
    };
}

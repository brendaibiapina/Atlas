const DEFAULT_ADMIN_EMAIL = 'brendaibiapina@testeatlas.com';

const configuredAdminEmail =
    process.env.ADMIN_EMAIL ??
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ??
    DEFAULT_ADMIN_EMAIL;

export const ADMIN_EMAIL = configuredAdminEmail.trim().toLowerCase();

export function isAdminEmail(email?: string | null): boolean {
    if (!email) return false;
    return email.trim().toLowerCase() === ADMIN_EMAIL;
}

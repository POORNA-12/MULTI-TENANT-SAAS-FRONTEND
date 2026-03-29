/* ── Cookie helpers ── */
function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("🚀 Portal API Base URL initialized:", API_BASE_URL);

function getFullUrl(endpoint) {
    if (endpoint.startsWith("http")) return endpoint;
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
}

/* ── Token helpers (exported for use by services) ── */
export function getAccessToken() {
    return getCookie('portal_access_token');
}

export function getRefreshToken() {
    return getCookie('portal_refresh_token');
}

export function setTokens(access, refresh) {
    if (access) setCookie('portal_access_token', access, 1);
    // Only update refresh token if a new one is provided (Rotation)
    if (refresh) setCookie('portal_refresh_token', refresh, 7);
}

export function clearTokens() {
    deleteCookie('portal_access_token');
    deleteCookie('portal_refresh_token');
    deleteCookie('portal_tenant_slug');
    deleteCookie('portal_user_email');
    deleteCookie('portal_tenant_user_id');
    deleteCookie('portal_tenant_id');
    deleteCookie('portal_user_role');
}

export function getTenantSlug() {
    return getCookie('portal_tenant_slug');
}

export function setTenantSlug(slug) {
    setCookie('portal_tenant_slug', slug, 7);
}

export function setUserEmail(email) {
    setCookie('portal_user_email', email, 7);
}

export function getUserEmail() {
    return getCookie('portal_user_email');
}

export function setTenantInfo(userId, tenantId) {
    if (userId) setCookie('portal_tenant_user_id', userId, 7);
    if (tenantId) setCookie('portal_tenant_id', tenantId, 7);
}

export function setUserRole(role) {
    setCookie('portal_user_role', role, 7);
}

export function getUserRole() {
    return getCookie('portal_user_role');
}

/**
 * Helper to get expiry timestamp from a JWT
 */
export function getTokenExp(token) {
    if (!token) return 0;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp;
    } catch {
        return 0;
    }
}

/* ── JWT expiry check ── */
function isTokenExpired(token) {
    const exp = getTokenExp(token);
    if (!exp) return true;
    // Refresh 60 seconds before actual expiry to be safe
    return exp * 1000 < Date.now() + 60000;
}

/* ── Token refresh (single in-flight promise to avoid race conditions) ── */
let refreshPromise = null;

async function ensureFreshToken(slug) {
    const access = getAccessToken();

    // Token exists and is still valid → nothing to do
    if (access && !isTokenExpired(access)) return true;

    // Token is expired or missing → refresh it
    const refresh = getRefreshToken();
    const tenantSlug = slug || getTenantSlug();
    
    // Hard check: if no refresh token or slug, we are definitely NOT authenticated
    if (!refresh || !tenantSlug) return false;

    // If a refresh is already in flight, wait for it (Race condition safety)
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            // BACKEND FIX: Added trailing slash to token-refresh/
            const url = getFullUrl(`/tenant_auth/${tenantSlug}/token-refresh/`);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
                credentials: 'include',
            });

            if (!res.ok) {
                // If the refresh token itself is invalid (401), we MUST clear everything
                if (res.status === 401 || res.status === 403) {
                    clearTokens();
                }
                return false;
            }

            const data = await res.json();
            const tokens = data.data || data;
            if (tokens.access) {
                // Save new tokens (Rotation)
                setTokens(tokens.access, tokens.refresh || refresh);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Token refresh critical error:", err);
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Shared API client with automatic JSON handling and auth token attachment.
 * Before authenticated requests, proactively checks if the access token is
 * expired and refreshes it first. Also retries once on 401/500.
 */
export async function apiClient(endpoint, { method = 'GET', body, auth = false, slug } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    // Proactively refresh if token is expired BEFORE making the request
    if (auth) {
        await ensureFreshToken(slug);
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const url = getFullUrl(endpoint);

    let res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    });

    // If 401 or 500 on an auth call, try refreshing once and retry
    if ((res.status === 401 || res.status === 500) && auth) {
        const refreshed = await ensureFreshToken(slug);
        if (refreshed) {
            headers['Authorization'] = `Bearer ${getAccessToken()}`;
            res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include',
            });
        }
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const error = new Error(data?.detail || data?.message || 'Something went wrong');
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

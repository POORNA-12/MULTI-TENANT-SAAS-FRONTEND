import {
    apiClient,
    setTokens,
    clearTokens,
    setTenantSlug,
    setUserEmail,
    setTenantInfo,
    getRefreshToken,
    setUserRole,
} from './api';

/**
 * Step 1 — Signup: sends OTP to email
 */
export async function signup(slug, email, password, reenterPassword) {
    return apiClient(`/tenant_auth/${slug}/signup/`, {
        method: 'POST',
        body: { email, password, reenter_password: reenterPassword },
    });
}

/**
 * Step 2 — Verify OTP & create user
 */
export async function verifySignup(slug, email, password, reenterPassword, verificationKey) {
    return apiClient(`/tenant_auth/${slug}/signup/`, {
        method: 'POST',
        body: {
            email,
            password,
            reenter_password: reenterPassword,
            verification_key: verificationKey,
        },
    });
}

/**
 * Manually resend verification OTP
 */
export async function sendVerification(email, tenantSlug) {
    return apiClient(`/tenant_auth/${tenantSlug}/send-verification/`, {
        method: 'POST',
        body: { email, tenant_slug: tenantSlug },
    });
}

/**
 * Signin — returns { message, data: { access, refresh }, tenant_user_id, tenant_id }
 */
export async function signin(slug, email, password) {
    const res = await apiClient(`/tenant_auth/${slug}/signin/`, {
        method: 'POST',
        body: { email, password },
    });

    // Tokens are nested inside res.data
    const tokens = res.data || res;
    setTokens(tokens.access, tokens.refresh);
    setTenantSlug(slug);
    setUserEmail(email);
    setTenantInfo(res.tenant_user_id, res.tenant_id);

    // Save user role if present
    const role = res.role || (res.data && res.data.role);
    if (role) {
        setUserRole(role);
    }

    return res;
}

/**
 * Signout — blacklist the refresh token
 */
export async function signout(slug) {
    const refresh = getRefreshToken();
    try {
        await apiClient(`/tenant_auth/${slug}/signout/`, {
            method: 'POST',
            body: { refresh },
            auth: true,
            slug,
        });
    } finally {
        clearTokens();
    }
}

/**
 * Change password (authenticated)
 */
export async function changePassword(slug, oldPassword, newPassword, confirmPassword) {
    return apiClient(`/tenant_auth/${slug}/change-password/`, {
        method: 'POST',
        body: {
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
        },
        auth: true,
        slug,
    });
}

/**
 * Forgot password — sends reset OTP
 */
export async function forgotPassword(tenantSlug, email) {
    return apiClient(`/tenant_auth/${tenantSlug}/forgot-password/`, {
        method: 'POST',
        body: { tenant_slug: tenantSlug, email },
    });
}

/**
 * Reset password using OTP
 */
export async function resetPassword(tenantSlug, email, otp, newPassword, confirmPassword) {
    return apiClient(`/tenant_auth/${tenantSlug}/reset-password/`, {
        method: 'POST',
        body: {
            tenant_slug: tenantSlug,
            email,
            otp,
            new_password: newPassword,
            confirm_password: confirmPassword,
        },
    });
}

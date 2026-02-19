import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import organizationService from "../services/organizationService";
import AuthService from "../services/authService";

export function useActiveTenant() {
    const { slug } = useParams();
    const [activeOrg, setActiveOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const syncTenant = async () => {
            setLoading(true);
            try {
                const token = AuthService.getDecodedToken();

                // CHECK: If this is a Tenant User (not SaaS), bypass SaaS endpoints
                if (token?.tenant_user_id) {
                    // Tenant Platform Context
                    // We don't need to fetch list or set active. We are bound to the tenant in the token.
                    // We assume the URL slug matches the tenant we are logged into (or backend will 403).
                    setActiveOrg({
                        id: token.tenant_id,
                        slug: slug, // Trust URL slug for now (backend validates)
                        name: token.tenant_name || slug // Fallback name
                    });
                    setLoading(false);
                    return;
                }

                // SaaS Platform Context (Existing Logic)
                const data = await organizationService.getOrganizations();
                const activeOrgId = token?.active_organization_id;

                let active = null;

                if (activeOrgId) {
                    active = data.organizations?.find(org => org.id === activeOrgId);
                }

                // Virtual Switching Logic for SaaS Admins
                // Priority 1: URL Slug (highest)
                // Priority 2: LocalStorage 'virtual_context_slug' (for SaaS dashboard browsing with context)

                let targetSlug = slug;
                if (!targetSlug) {
                    targetSlug = localStorage.getItem('virtual_context_slug');
                }

                if (targetSlug) {
                    const requestedOrg = data.organizations?.find(o => o.slug === targetSlug);
                    if (requestedOrg) {
                        // "Virtual" Switch - Update local state
                        active = requestedOrg;
                    } else {
                        // verify if slug is invalid? 
                        // If url slug is invalid, error.
                        // If storage slug is invalid, maybe clear it?
                        if (slug && isMounted) setError("Tenant not found");
                    }
                }
                // Fallback: If no slug in URL or Storage, but we have an active org in token, use that
                else if (activeOrgId && !active) {
                    // logic already handled above by finding by ID
                }

                if (isMounted) setActiveOrg(active || null);
            } catch (err) {
                console.error("Failed to sync tenant:", err);
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        syncTenant();

        const handleOrgChange = () => {
            syncTenant();
        };

        window.addEventListener("activeOrgChanged", handleOrgChange);
        window.addEventListener("virtualContextChanged", handleOrgChange); // Listen for virtual switches
        return () => {
            isMounted = false;
            window.removeEventListener("activeOrgChanged", handleOrgChange);
            window.removeEventListener("virtualContextChanged", handleOrgChange);
        };

    }, [slug]);

    return { activeOrg, loading, error };
}

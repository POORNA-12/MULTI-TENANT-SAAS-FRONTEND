import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import organizationService from "../services/organizationService";
import AuthService from "../services/authService";
import { useOrganizations } from "./useOrganizations";

export function useActiveTenant() {
    const { slug } = useParams();
    const [activeOrg, setActiveOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { data: organizations, isLoading: orgLoading, error: orgError } = useOrganizations();

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
                    if (isMounted) {
                        setActiveOrg({
                            id: token.tenant_id,
                            slug: slug, // Trust URL slug for now (backend validates)
                            name: token.tenant_name || slug // Fallback name
                        });
                        setLoading(false);
                    }
                    return;
                }

                // SaaS Platform Context (Existing Logic)
                if (orgLoading) return; // Wait until global organizations are loaded

                if (orgError) throw orgError;

                const activeOrgId = token?.active_organization_id;

                let active = null;

                if (activeOrgId && organizations) {
                    active = organizations.find(org => org.id === activeOrgId);
                }

                // Virtual Switching Logic for SaaS Admins
                // Priority 1: URL Slug (highest)
                // Priority 2: LocalStorage 'virtual_context_slug' (for SaaS dashboard browsing with context)

                let targetSlug = slug;
                if (!targetSlug) {
                    targetSlug = localStorage.getItem('virtual_context_slug');
                }

                if (targetSlug && organizations) {
                    const requestedOrg = organizations.find(o => o.slug === targetSlug);
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

    }, [slug, organizations, orgLoading, orgError]);

    return { activeOrg, loading, error };
}

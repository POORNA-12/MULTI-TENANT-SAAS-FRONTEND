import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import billingService from "../services/billingService";

const BillingContext = createContext();

export const useBilling = () => {
    return useContext(BillingContext);
};

export const BillingProvider = ({ children }) => {
    const [billingUsage, setBillingUsage] = useState({
        subscription_plan: 'Enterprise',
        subscription_status: 'Active',
        days_until_expiry: null,
        limits: {
            max_organizations: 10,
            max_users_per_organization: 100,
            max_workflow_definitions: 50,
            max_roles: 20
        },
        usage: {
            organizations: 0,
            total_users: 0,
            total_workflows: 0,
            total_roles: 0
        }
    });
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeModalMessage, setUpgradeModalMessage] = useState("");
    const [modalDismissed, setModalDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = () => {
        return !!Cookies.get("accessToken");
    };

    const fetchBillingUsage = useCallback(async () => {
        if (!checkAuthStatus()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await billingService.getUsageAndLimits();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                setBillingUsage(data);
            } else {
                console.error("Malformed billing usage data received:", data);
            }
        } catch (error) {
            console.error("Failed to fetch billing usage:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchBillingUsage();
    }, [fetchBillingUsage]);

    // Listen for custom 402 error event from api.js
    useEffect(() => {
        const handleQuotaExceeded = (e) => {
            const errorData = e.detail;
            const errorDetail = errorData?.detail || "You have reached your subscription limit.";
            const isExpired = errorDetail.toLowerCase().includes('expired');

            // If expired, update global billing status so UI can react (show "Expired" next to plan)
            if (isExpired) {
                setBillingUsage(prev => ({
                    ...prev,
                    subscription_status: 'Expired'
                }));
            }

            // Prevent auto-opening if user dismissed it OR is already on the billing page
            if (modalDismissed || window.location.pathname === '/dashboard/billing' || window.location.pathname === '/dashboard/billing/plans') {
                return;
            }

            setUpgradeModalMessage(errorDetail);
            setIsUpgradeModalOpen(true);

            // Optionally refresh usage to have the most up to date limits vs usage displayed
            fetchBillingUsage();
        };

        window.addEventListener("billing:quota_exceeded", handleQuotaExceeded);
        return () => window.removeEventListener("billing:quota_exceeded", handleQuotaExceeded);
    }, [fetchBillingUsage, modalDismissed]);

    const canCreateResource = useCallback((resourceType, orgId = null) => {
        if (!billingUsage) return true; // Fail open if no data (backend still protects)

        const { limits, usage } = billingUsage;

        switch (resourceType) {
            case 'organizations':
                return usage.organizations < limits.max_organizations;
            case 'users':
                if (orgId && usage.users_per_org) {
                    return (usage.users_per_org[orgId] || 0) < limits.max_users_per_organization;
                }
                return true; // if orgId not provided, we can't accurately check per-org frontendly
            case 'workflows':
                if (orgId && usage.workflows_per_org) {
                    return (usage.workflows_per_org[orgId] || 0) < limits.max_workflow_definitions;
                }
                return true;
            case 'roles':
                if (orgId && usage.roles_per_org) {
                    return (usage.roles_per_org[orgId] || 0) < limits.max_roles;
                }
                return true;
            default:
                return true;
        }
    }, [billingUsage]);

    const value = {
        billingUsage,
        loading,
        fetchBillingUsage,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        modalDismissed,
        setModalDismissed,
        upgradeModalMessage,
        canCreateResource
    };

    return (
        <BillingContext.Provider value={value}>
            {children}
        </BillingContext.Provider>
    );
};

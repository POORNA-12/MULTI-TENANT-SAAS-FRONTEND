import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import Solutions from "./pages/Solutions";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import AuthService from "./pages/AuthService";
import SystemMetrics from "./pages/SystemMetrics";
import RoleManagement from "./pages/RoleManagement.jsx";
import Workflows from "./pages/Workflows";
import AuditLogs from "./pages/AuditLogs";
import GlobalSettings from "./pages/GlobalSettings";
import SupportCenter from "./pages/SupportCenter";
import BillingDashboard from "./pages/BillingDashboard";
import PricingPlans from "./pages/PricingPlans";
import PublicPricing from "./pages/PublicPricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancelled from "./pages/CheckoutCancelled";
import { SearchProvider } from "./context/SearchContext";
import { BillingProvider } from "./context/BillingContext";
import UpgradeModal from "./components/UpgradeModal";
import DashboardLayout from "./layouts/DashboardLayout";

import React, { Suspense, lazy } from "react";
// Tenant Platform Imports (Lazy Loaded)
const PortalApp = lazy(() => import("./modules/tenant-platform/PortalApp"));

export default function App() {
  return (
    <SearchProvider>
      <BillingProvider>
        <UpgradeModal />
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/set-password" element={<SetPassword />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/tenants" element={<Tenants />} />
          <Route path="/dashboard/auth" element={<AuthService />} />
          <Route path="/dashboard/metrics" element={<SystemMetrics />} />
          <Route path="/dashboard/roles" element={<RoleManagement />} />
          <Route path="/dashboard/workflows" element={<Workflows />} />
          <Route path="/dashboard/audit" element={<AuditLogs />} />
          <Route path="/dashboard/settings" element={<GlobalSettings />} />
          <Route path="/dashboard/support" element={<SupportCenter />} />
          <Route path="/dashboard/billing" element={<BillingDashboard />} />
          <Route path="/dashboard/billing/plans" element={<PricingPlans />} />

          {/* Independent Tenant Portal Module (Lazy Loaded) */}
          <Route 
            path="/portal/*" 
            element={
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-bg">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <PortalApp />
              </Suspense>
            } 
          />

          {/* Other Routes */}
          <Route path="/pricing" element={<PublicPricing />} />
          <Route path="/billing/success" element={<CheckoutSuccess />} />
          <Route path="/billing/cancelled" element={<CheckoutCancelled />} />
        </Routes>
      </BillingProvider>
    </SearchProvider>
  );
}

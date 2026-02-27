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
import { SearchProvider } from "./context/SearchContext";

export default function App() {
  return (
    <SearchProvider>
      <Routes>
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
      </Routes>
    </SearchProvider>
  );
}

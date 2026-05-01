import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import AuthPage from './pages/AuthPage';
import WorkflowDashboard from './pages/WorkflowDashboard';
import MyRequests from './pages/MyRequests';
import MyApprovals from './pages/MyApprovals';
import PendingApprovals from './pages/PendingApprovals';
import WorkflowStatus from './pages/WorkflowStatus';
import CreateWorkflow from './pages/CreateWorkflow';
import ApplyWorkflow from './pages/ApplyWorkflow';

export default function PortalApp() {
    return (
        <div className="portal-theme min-h-screen">
            <AuthProvider>
                <Routes>
                    {/* ── Public Routes ── */}
                    {/* Support both /portal and /portal/login */}
                    <Route path="/" element={<AuthPage />} />
                    <Route path="login" element={<AuthPage />} />
                    <Route path="signup" element={<AuthPage />} />

                    {/* ── Protected Shell ── */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* These match the original project's paths redirected into the /portal namespace */}
                        <Route path="dashboard" element={<WorkflowDashboard />} />
                        <Route path="my-requests" element={<MyRequests />} />
                        <Route path="my-approvals" element={<PendingApprovals />} />
                        <Route path="requests" element={<MyRequests />} />

                        {/* Management & Status */}
                        <Route path="dashboard/approvals" element={<PendingApprovals />} />
                        <Route path="dashboard/workflows/new" element={<CreateWorkflow />} />
                        <Route path="dashboard/workflows/:requestId" element={<WorkflowStatus />} />

                        {/* Operations */}
                        <Route path="apply/:definitionId" element={<ApplyWorkflow />} />

                        {/* Placeholders for missing pages found in original sidebar */}
                        <Route path="drafts" element={<div className="p-8 text-center bg-white rounded-xl border border-border">Drafts management coming soon...</div>} />
                        <Route path="settings" element={<div className="p-8 text-center bg-white rounded-xl border border-border">Profile settings coming soon...</div>} />
                        <Route path="support" element={<div className="p-8 text-center bg-white rounded-xl border border-border">Support center coming soon...</div>} />
                    </Route>

                    {/* ── Catch-all ── */}
                    <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </div>
    );
}

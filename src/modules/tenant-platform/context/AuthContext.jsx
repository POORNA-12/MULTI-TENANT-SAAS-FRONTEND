import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, getTenantSlug, getUserEmail, getUserRole, clearTokens, setUserEmail, setUserRole } from '../services/api';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tenantSlug, setTenantSlug] = useState('');
    const [loading, setLoading] = useState(true);

    // Restore session from cookies on mount
    useEffect(() => {
        const token = getAccessToken();
        const slug = getTenantSlug();
        const email = getUserEmail();
        const role = getUserRole();

        if (token && slug) {
            setUser({ email: email || 'User', role });
            setTenantSlug(slug);
        }
        setLoading(false);
    }, []);

    const login = (slug, email, role) => {
        setUser({ email, role });
        setTenantSlug(slug);
        setUserEmail(email);
        if (role) setUserRole(role);
        // Navigate to the portal dashboard
        navigate('/portal/dashboard');
    };

    const logout = async () => {
        try {
            await authService.signout(tenantSlug);
        } catch {
            // still clear even if API fails
            clearTokens();
        }
        
        // Signal logout to other tabs
        localStorage.setItem('portal_logout_signal', Date.now());
        
        setUser(null);
        setTenantSlug('');
        // Navigate back to portal login
        navigate('/portal/login');
    };

    const isAuthenticated = !!user && !!getAccessToken();

    return (
        <AuthContext.Provider value={{ user, tenantSlug, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

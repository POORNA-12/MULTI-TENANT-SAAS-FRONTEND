import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Building2,
    ExternalLink,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';

export default function PortalLoginCard() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        orgSlug: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { orgSlug, email, password } = formData;

        if (!orgSlug.trim()) {
            setError('Organization slug is required.');
            setLoading(false);
            return;
        }

        try {
            const data = await authService.signin(orgSlug, email, password);
            const role = data.role || (data.data && data.data.role);
            login(orgSlug, email, role);
        } catch (err) {
            if (err.data && typeof err.data === 'object') {
                const messages = Object.values(err.data)
                    .flat()
                    .filter((v) => typeof v === 'string');
                setError(messages.join(' ') || err.message);
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <div className="w-14 h-14 bg-portal-primary rounded-2xl flex items-center justify-center shadow-lg shadow-portal-primary/30 transform hover:scale-105 transition-transform duration-300">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="8" r="3" fill="white" />
                        <circle cx="6" cy="16" r="3" fill="white" />
                        <circle cx="18" cy="16" r="3" fill="white" />
                        <line x1="12" y1="11" x2="6" y2="13" stroke="white" strokeWidth="2" />
                        <line x1="12" y1="11" x2="18" y2="13" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
            </div>

            {/* Card */}
            <div className="bg-portal-cardbg rounded-3xl shadow-2xl shadow-black/10 border border-portal-border/60 overflow-hidden backdrop-blur-sm">
                <div className="px-8 pt-8 pb-2">
                    <h1 className="text-3xl font-black text-portal-textprimary tracking-tight leading-tight">
                        Welcome Back
                    </h1>
                    <h2 className="text-xl font-bold text-portal-textprimary/80 mt-1">
                        Sign In
                    </h2>
                    <p className="text-sm text-portal-textsecondary mt-2 mb-6">
                        Enter your organization details to continue to the dashboard.
                    </p>

                    <div className="flex bg-portal-bg rounded-2xl p-1 mb-8 border border-portal-border/60">
                        <div className="flex-1 py-3 text-sm font-black rounded-xl bg-portal-cardbg text-portal-textprimary shadow-sm text-center">
                            Sign In
                        </div>
                        <Link
                            to="/portal/signup"
                            className="flex-1 py-3 text-sm font-bold rounded-xl text-portal-textsecondary hover:text-portal-textprimary transition-all duration-200 text-center"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mx-8 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-danger font-bold animate-in shake duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                    {/* Organization Slug */}
                    <div>
                        <label className="flex items-center text-[13px] font-black text-portal-textprimary uppercase tracking-wider mb-2 ml-1">
                            Organization Slug
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                name="orgSlug"
                                value={formData.orgSlug}
                                onChange={handleChange}
                                placeholder="my-company-slug"
                                className="w-full px-5 py-4 bg-portal-inputbg border-2 border-portal-border/50 rounded-2xl text-sm font-bold text-portal-textprimary placeholder:text-portal-textmuted focus:outline-none focus:border-portal-primary focus:ring-4 focus:ring-portal-primary/10 transition-all duration-300"
                            />
                            <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-portal-textmuted group-focus-within:text-portal-primary transition-colors" />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[13px] font-black text-portal-textprimary uppercase tracking-wider mb-2 ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full px-5 py-4 bg-portal-inputbg border-2 border-portal-border/50 rounded-2xl text-sm font-bold text-portal-textprimary placeholder:text-portal-textmuted focus:outline-none focus:border-portal-primary focus:ring-4 focus:ring-portal-primary/10 transition-all duration-300"
                            />
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-portal-textmuted group-focus-within:text-portal-primary transition-colors" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[13px] font-black text-portal-textprimary uppercase tracking-wider mb-2 ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-portal-inputbg border-2 border-portal-border/50 rounded-2xl text-sm font-bold text-portal-textprimary placeholder:text-portal-textmuted focus:outline-none focus:border-portal-primary focus:ring-4 focus:ring-portal-primary/10 transition-all duration-300 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-portal-textmuted hover:text-portal-primary transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <Eye className="w-5 h-5" />
                                ) : (
                                    <EyeOff className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-portal-primary hover:bg-portal-primary-hover text-white font-black rounded-2xl shadow-xl shadow-portal-primary/30 hover:shadow-portal-primary/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In to Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <a
                            href="#"
                            className="text-sm font-bold text-portal-textprimary hover:text-portal-primary transition-colors"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-5 border-t border-portal-border/60 bg-portal-bg/50">
                    <span className="text-xs text-portal-primary/80 font-bold uppercase tracking-wider">
                        Enterprise SSO
                    </span>
                    <a
                        href="#"
                        className="text-xs font-black text-portal-primary hover:text-portal-primary-hover flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                    >
                        Support
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-8 mt-10 text-portal-textmuted/60">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    SECURE SSL
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                    <Lock className="w-4 h-4" />
                    AES-256
                </div>
            </div>
        </div>
    );
}

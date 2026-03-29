import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthService from "../services/authService";
import PasswordInput from "../components/PasswordInput";

export default function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        reenter_password: "",
        user_type: "saas-user"
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password !== formData.reenter_password) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Step 1: Register User (Sends OTP)
            await AuthService.signUp(formData);

            // Navigate to verify email page with registration data
            navigate("/verify-email", {
                state: {
                    email: formData.email,
                    password: formData.password,
                    reenter_password: formData.reenter_password,
                    user_type: formData.user_type
                }
            });
        } catch (err) {
            console.error("Signup failed", err);
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Create your TenantX Account
                </h2>
                <p className="text-sm text-[#4e7397] mt-1">
                    Get started with our enterprise-grade multi-tenant platform.
                </p>
            </div>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                    {error}
                </div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="email"
                    >
                        Email Address
                    </label>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="email"
                        placeholder="name@company.com"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <PasswordInput
                    label="Password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    showStrength={true}
                    required
                />
                
                <PasswordInput
                    label="Confirm Password"
                    id="reenter_password"
                    value={formData.reenter_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                />
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="user_type"
                    >
                        User Type
                    </label>
                    <select
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                    >
                        <option value="saas-user">SaaS User</option>

                    </select>
                </div>
<div className="pt-2">
    <button
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded transition-all duration-200 text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        type="submit"
        disabled={loading}
    >
        {loading ? (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : "Create Account"}
    </button>
</div>
                <p className="text-xs text-[#4e7397] text-center mt-4">
                    By signing up, you agree to the{" "}
                    <a className="text-primary hover:underline" href="#">
                        Customer Agreement
                    </a>{" "}
                    and{" "}
                    <a className="text-primary hover:underline" href="#">
                        Privacy Notice
                    </a>
                    .
                </p>
                <div className="border-t border-[#d0dbe7] pt-4 mt-6 flex flex-col items-center">
                    <p className="text-sm text-[#0e141b]">
                        Already have an account?
                    </p>
                    <Link
                        to="/signin"
                        className="mt-2 w-full text-center py-2 px-4 border border-[#d0dbe7] rounded text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

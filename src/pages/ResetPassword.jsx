import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthService from "../services/authService";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            await AuthService.forgotPassword(email);
            // Navigate to set password page with email in state
            navigate("/set-password", { state: { email } });
        } catch (err) {
            console.error("Reset password request failed", err);
            setError(err.response?.data?.message || "Failed to send reset code. Please check your email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Reset your password
                </h2>
                <p className="text-sm text-[#4e7397] mt-2">
                    Enter your email address and we'll send you a code to reset your
                    password.
                </p>
            </div>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                    {error}
                </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-sm disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Sending Reset Code..." : "Send Reset Code"}
                    </button>
                </div>
                <div className="border-t border-[#d0dbe7] pt-6 mt-6 flex flex-col items-center">
                    <Link
                        to="/signin"
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            chevron_left
                        </span>
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

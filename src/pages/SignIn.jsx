import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthService from "../services/authService";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await AuthService.signIn(email, password, rememberMe);
            navigate("/dashboard"); // Redirect to dashboard on success
        } catch (err) {
            console.error("Sign in failed", err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(err.response.data.message || "Invalid credentials");
            } else if (err.request) {
                // The request was made but no response was received
                // `err.request` is an instance of XMLHttpRequest in the browser 
                // and an instance of http.ClientRequest in node.js
                setError("Unable to connect to the server. Please check if the backend is running and CORS is enabled.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError("An error occurred while setting up the request.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Sign In
                </h2>
                <p className="text-sm text-[#4e7397] mt-1">
                    Access your enterprise multi-tenant dashboard.
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label
                            className="block text-sm font-bold text-[#0e141b]"
                            htmlFor="password"
                        >
                            Password
                        </label>
                    </div>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="password"
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-[#0e141b] cursor-pointer select-none">
                                Remember me
                            </label>
                        </div>
                        <div className="text-right">
                            <Link
                                to="/reset-password"
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </div>
                <div className="border-t border-[#d0dbe7] pt-4 mt-6 flex flex-col items-center">
                    <p className="text-sm text-[#0e141b]">
                        Don't have an account?
                    </p>
                    <Link
                        to="/signup"
                        className="mt-2 w-full text-center py-2 px-4 border border-[#d0dbe7] rounded text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

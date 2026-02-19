import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthService from "../services/authService";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { email, password, reenter_password, user_type } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      const inputs = document.querySelectorAll("input[type='text']");
      if (inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const verificationKey = otp.join("");
    if (verificationKey.length !== 6) {
      setError("Please enter a complete 6-digit code");
      setLoading(false);
      return;
    }

    try {
      await AuthService.signUp({
        email,
        password,
        reenter_password,
        user_type,
        verification_key: verificationKey
      });
      // Tokens are stored by AuthService.signUp
      navigate("/dashboard");
    } catch (err) {
      console.error("Verification failed", err);
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await AuthService.sendVerificationToken(email);
      setMessage("Verification code resent successfully");
    } catch (err) {
      console.error("Resend failed", err);
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  if (!email) return null;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0e141b]">
          Verify your email
        </h2>
        <p className="text-sm text-[#4e7397] mt-2 leading-relaxed">
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold text-[#0e141b]">
            {email}
          </span>
          . Please enter it below to complete your registration.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded">
          {message}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold text-[#0e141b] mb-4">
            Verification Code
          </label>
          <div className="flex gap-2 sm:gap-3 justify-between">
            {otp.map((data, index) => (
              <input
                key={index}
                className="w-12 h-14 text-center text-xl font-bold border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                maxLength="1"
                type="text"
                name="otp"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#4e7397]">
            Didn't receive a code?
          </span>
          <button
            type="button"
            onClick={handleResend}
            className="text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer"
          >
            Resend code
          </button>
        </div>
        <div className="pt-2">
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded transition-colors text-sm shadow-sm disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify and Create Account"}
          </button>
        </div>
        <div className="border-t border-[#d0dbe7] pt-4 mt-6 flex flex-col items-center">
          <Link
            to="/signup"
            className="text-sm font-bold text-[#4e7397] hover:text-[#0e141b] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

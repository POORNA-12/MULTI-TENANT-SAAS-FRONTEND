import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/set-password");
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0e141b]">
          Verify your email
        </h2>
        <p className="text-sm text-[#4e7397] mt-2 leading-relaxed">
          We've sent a 6-digit verification code to
          <span className="font-semibold text-[#0e141b]">
            user@example.com
          </span>
          . Please enter it below to complete your registration.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold text-[#0e141b] mb-4">
            Verification Code
          </label>
          <div className="flex gap-2 sm:gap-3 justify-between">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                className="w-12 h-14 text-center text-xl font-bold border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                id={`otp-${i + 1}`}
                maxLength="1"
                pattern="[0-9]*"
                type="text"
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#4e7397]">
            Didn't receive a code?
          </span>
          <a className="text-xs font-bold text-primary hover:underline" href="#">
            Resend code
          </a>
        </div>
        <div className="pt-2">
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded transition-colors text-sm shadow-sm"
            type="submit"
          >
            Verify and Create Account
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

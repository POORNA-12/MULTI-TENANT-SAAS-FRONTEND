import React, { useState } from 'react';

const PasswordInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = "Enter password", 
    name = "password",
    id = name,
    showStrength = false,
    required = true,
    className = ""
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const getStrength = (pwd) => {
        if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
        if (pwd.length < 6) return { score: 1, label: "Too weak", color: "bg-red-500" };
        
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (score <= 1) return { score: 2, label: "Weak", color: "bg-orange-400" };
        if (score === 2) return { score: 3, label: "Medium", color: "bg-yellow-400" };
        if (score === 3) return { score: 4, label: "Good", color: "bg-blue-400" };
        return { score: 5, label: "Strong", color: "bg-green-500" };
    };

    const strength = getStrength(value);

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-sm font-bold text-[#0e141b]">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    required={required}
                    className="w-full h-11 px-4 pr-11 bg-white border border-[#d0dbe7] rounded-lg text-sm text-[#0e141b] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4e7397] hover:text-[#0e141b] transition-colors"
                    tabIndex="-1"
                >
                    <span className="material-symbols-outlined text-[20px] select-none">
                        {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>

            {showStrength && value && (
                <div className="pt-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-[#4e7397] uppercase tracking-wider">
                            Password Strength: <span className={strength.label === 'Too weak' ? 'text-red-500' : ''}>{strength.label}</span>
                        </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div 
                                key={step}
                                className={`h-full flex-1 transition-all duration-500 ${step <= strength.score ? strength.color : 'bg-slate-200'}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordInput;

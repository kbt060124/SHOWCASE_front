import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Step1FormProps {
    email: string;
    password: string;
    passwordConfirmation: string;
    showPassword: boolean;
    showPasswordConfirmation: boolean;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setPasswordConfirmation: (value: string) => void;
    setShowPassword: (value: boolean) => void;
    setShowPasswordConfirmation: (value: boolean) => void;
}

export const Step1Form: React.FC<Step1FormProps> = ({
    email,
    password,
    passwordConfirmation,
    showPassword,
    showPasswordConfirmation,
    setEmail,
    setPassword,
    setPasswordConfirmation,
    setShowPassword,
    setShowPasswordConfirmation,
}) => {
    const inputClassName =
        "appearance-none block w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500";

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                    E-mail
                </label>
                <input
                    id="email"
                    type="email"
                    className={inputClassName}
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="relative">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={inputClassName}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    <VisibilityIcon />
                </button>
            </div>
            <div className="relative">
                <label
                    htmlFor="passwordConfirmation"
                    className="block text-sm font-medium text-gray-700"
                >
                    Confirm Password
                </label>
                <input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    className={inputClassName}
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                >
                    <VisibilityIcon />
                </button>
            </div>
        </div>
    );
};

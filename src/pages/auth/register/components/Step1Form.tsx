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
        "appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="space-y-4">
            <div>
                <input
                    type="email"
                    className={inputClassName}
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className={inputClassName}
                    placeholder="Password"
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
                <input
                    type={showPasswordConfirmation ? "text" : "password"}
                    className={inputClassName}
                    placeholder="Confirm Password"
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

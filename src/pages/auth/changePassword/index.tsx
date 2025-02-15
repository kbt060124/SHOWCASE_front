import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/useAuth";
import VisibilityIcon from "@mui/icons-material/Visibility";

const ChangePassword = () => {
    const { user, changePassword, error: authError } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] =
        useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setLoading(true);

        const success = await changePassword({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPasswordConfirmation,
        });

        if (success) {
            setSuccess("パスワードが変更されました");
            // 3秒後にプロフィールページに遷移
            setTimeout(() => {
                navigate(`/profile/${user?.id}`);
            }, 3000);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-16 px-4">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-8">Change password</h1>

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {success}
                    </div>
                )}

                {authError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 現在のパスワード */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <VisibilityIcon />
                            </button>
                        </div>
                    </div>

                    {/* 新しいパスワード */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <VisibilityIcon />
                            </button>
                        </div>
                    </div>

                    {/* 新しいパスワード（確認） */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={
                                    showNewPasswordConfirmation
                                        ? "text"
                                        : "password"
                                }
                                value={newPasswordConfirmation}
                                onChange={(e) =>
                                    setNewPasswordConfirmation(e.target.value)
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPasswordConfirmation(
                                        !showNewPasswordConfirmation
                                    )
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <VisibilityIcon />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? "Changing..." : "Next"}
                    </button>

                    <div className="text-center">
                        <a
                            href={`/profile/${user?.id}`}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Back to profile
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;

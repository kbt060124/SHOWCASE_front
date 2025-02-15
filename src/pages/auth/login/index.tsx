import React, { useState, useEffect } from "react";
import { useAuth } from "../../../utils/useAuth";
import { useNavigate, Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "@/utils/axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            const checkProfileAndRedirect = async () => {
                try {
                    const { data } = await api.get(`/api/room/${user?.id}`);
                    if (data.rooms) {
                        navigate(`/mainstage/${data.rooms[0].id}`, {
                            replace: true,
                        });
                    }
                } catch (error) {
                    console.error("ルーム取得エラー:", error);
                    navigate("/warehose", { replace: true }); // フォールバック
                }
            };
            checkProfileAndRedirect();
        }
    }, [isAuthenticated, navigate, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
        } catch (err) {
            console.error("ログインエラー:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="max-w-md w-full space-y-6 p-8 relative min-h-[600px]">
                <div className="flex justify-center">
                    <img
                        src="/icons/Logo_Black 400 by 100.png"
                        alt="Kükancase Logo"
                        className="w-[400px] h-[100px]"
                    />
                </div>
                <p className="text-center text-gray-600 -mt-6">
                    This is a placeholder this is a placeholder
                </p>
                <div className="h-1"></div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <VisibilityIcon />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Remember Me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a
                                href="#"
                                className="text-red-600 hover:text-red-500"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center absolute bottom-8 left-0 right-0">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-500"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

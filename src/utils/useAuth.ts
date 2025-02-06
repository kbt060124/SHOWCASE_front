import { useState, useEffect } from "react";
import api from "@/utils/axios";
import Cookies from "js-cookie";

interface User {
    id: number;
    name: string;
    email: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials extends LoginCredentials {
    email: string;
    password_confirmation: string;
}

interface ChangePasswordData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const checkAuth = async () => {
        try {
            await getCsrfToken();
            const response = await api.get("/api/user");
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
            console.error("認証チェックエラー:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const getCsrfToken = async () => {
        await api.get("/sanctum/csrf-cookie");
        const token = Cookies.get("XSRF-TOKEN");
        if (token) {
            api.defaults.headers.common["X-XSRF-TOKEN"] =
                decodeURIComponent(token);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        setLoading(true);
        setError(null);
        try {
            await getCsrfToken();
            const response = await api.post("/login", credentials);
            if (response.status === 204) {
                const userResponse = await api.get("/api/user");
                setUser(userResponse.data);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || "ログインに失敗しました");
            setUser(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await getCsrfToken();
            await api.post("/logout");
            setUser(null);
            setIsAuthenticated(false);
            return true;
        } catch (err) {
            setError("ログアウトに失敗しました");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            setLoading(true);
            setError(null);
            await getCsrfToken();

            const registerResponse = await api
                .post("/register", credentials)
                .catch((err) => {
                    throw err;
                });

            if (registerResponse.status === 204) {
                try {
                    const userResponse = await api.get("/api/user");
                    if (!userResponse.data) {
                        throw new Error("ユーザー情報が取得できませんでした");
                    }

                    setUser(userResponse.data);
                    setIsAuthenticated(true);
                    return {
                        success: true,
                        user: userResponse.data,
                    };
                } catch (userError) {
                    throw userError;
                }
            }

            return {
                success: false,
                user: null,
            };
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors)
                    .flat()
                    .join("\n");
                setError(errorMessages);
            } else {
                setError(err.message || "登録に失敗しました");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (data: ChangePasswordData) => {
        try {
            await api.put("/password/update", data);
            return true;
        } catch (err: any) {
            setError(
                err.response?.data?.message || "パスワードの変更に失敗しました"
            );
            return false;
        }
    };

    return {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        register,
        checkAuth,
        changePassword,
    };
};

import { useState, useEffect } from "react";
import api from "../axios";
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
    name: string;
    password_confirmation: string;
}

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [rooms, setRooms] = useState<any[]>([]);

    const checkAuth = async () => {
        try {
            await getCsrfToken();
            const response = await api.get("/api/user");
            setUser(response.data);
            setIsAuthenticated(true);
            setRooms(response.data.rooms);
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
            console.log("Login response:", response);
            if (response.status === 200) {
                const userResponse = await api.get("/api/user");
                setUser(userResponse.data);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (err: any) {
            console.error("Login error:", err);
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
            await api.post("/register", credentials);
            await checkAuth();
            return true;
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors)
                    .flat()
                    .join("\n");
                setError(errorMessages);
            } else {
                setError("登録に失敗しました");
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        isAuthenticated,
        rooms,
        login,
        logout,
        register,
        checkAuth,
    };
};

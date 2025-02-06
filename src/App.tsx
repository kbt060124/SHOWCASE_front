import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Home from "@/pages/home";
import Studio from "@/pages/studio";
import Warehouse from "@/pages/warehouse";
import Profile from "@/pages/profile";
import CreateProfile from "@/pages/profile/Create";
import Mainstage from "@/pages/mainstage";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { useAuth } from "@/utils/useAuth";
import "@/App.css";
import api from "@/utils/axios";
import ChangePassword from "./pages/ChangePassword";

// 認証が必要なルートを保護するためのコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    console.log("Protected Route - isAuthenticated:", isAuthenticated);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    useEffect(() => {
        // CSRFトークンを取得
        const getCsrfToken = async () => {
            try {
                await api.get("/sanctum/csrf-cookie");
            } catch (error) {
                console.error("CSRFトークンの取得に失敗:", error);
            }
        };

        getCsrfToken();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/studio/:room_id"
                    element={
                        <ProtectedRoute>
                            <Studio />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/warehouse"
                    element={
                        <ProtectedRoute>
                            <Warehouse />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/create"
                    element={
                        <ProtectedRoute>
                            <CreateProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:user_id"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mainstage/:room_id"
                    element={
                        <ProtectedRoute>
                            <Mainstage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

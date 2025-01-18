import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import Warehouse from "./pages/Warehouse";
import Profile from "./pages/Profile";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { useAuth } from "./hooks/useAuth";
import "./App.css";
import axios from "axios";

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
                await axios.get("http://localhost/sanctum/csrf-cookie", {
                    withCredentials: true,
                });
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
                    path="/profile/:user_id"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

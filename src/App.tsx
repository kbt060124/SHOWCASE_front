import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Studio from "@/pages/studio";
import Warehouse from "@/pages/warehouse";
import Profile from "@/pages/profile";
import Visit from "@/pages/visit";
import Mainstage from "@/pages/mainstage";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { useAuth } from "@/utils/useAuth";
import "@/App.css";
import api from "@/utils/axios";
import MenuBar from "./components/MenuBar";
import ChangePassword from "./pages/auth/changePassword";
import ReactGA from "react-ga4";
import { PageTimeTracker, trackPageTransition } from "@/utils/analytics";

// 初期化
ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);

// 認証が必要なルートを保護するためのコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// メニューバーを表示しないパスのリスト
const noNavPaths = ["/login", "/register", "/change-password"];

const App = () => {
    const location = useLocation();
    const showNav = !noNavPaths.some((path) =>
        location.pathname.startsWith(path)
    );
    const timeTrackerRef = useRef<PageTimeTracker | null>(null);

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

    useEffect(() => {
        const previousPath = sessionStorage.getItem("currentPath") || "";
        const currentPath = location.pathname;

        // ページビューの送信
        ReactGA.send({
            hitType: "pageview",
            page: currentPath + location.search,
        });

        // ページ遷移のトラッキング
        if (previousPath !== currentPath) {
            trackPageTransition(previousPath, currentPath);
        }

        // 現在のパスを保存
        sessionStorage.setItem("currentPath", currentPath);
    }, [location]);

    useEffect(() => {
        // 新しいページのトラッカーを作成
        timeTrackerRef.current = new PageTimeTracker(location.pathname);

        // コンポーネントのアンマウント時にクリーンアップ
        return () => {
            if (timeTrackerRef.current) {
                timeTrackerRef.current.cleanup();
            }
        };
    }, [location.pathname]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh", // ビューポートの高さいっぱいに広げる
            }}
        >
            <div style={{ flex: 1 }}>
                {" "}
                {/* メインコンテンツエリア */}
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/warehouse" replace />}
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/change-password"
                        element={<ChangePassword />}
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
                    <Route
                        path="/mainstage/:room_id"
                        element={
                            <ProtectedRoute>
                                <Mainstage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/visit" element={<Visit />} />
                </Routes>
            </div>
            {showNav && <MenuBar />}
        </div>
    );
};

export default App;

import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import Warehouse from "./pages/Warehouse";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

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
                    path="/studio"
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
            </Routes>
        </Router>
    );
}

export default App;

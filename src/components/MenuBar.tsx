import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useAuth } from "@/utils/useAuth";
import api from "@/utils/axios";
import { useEffect, useState } from "react";

export const MENU_BAR_HEIGHT = 56;

const labelStyle = {
    fontFamily: "Open Sans",
    fontWeight: 900,
    fontSize: "10px",
} as const;

const MenuBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [roomId, setRoomId] = useState<string>();
    const [fromVisit, setFromVisit] = useState(false);

    useEffect(() => {
        const state = location.state as { fromVisit?: boolean } | null;
        setFromVisit(!!state?.fromVisit);
    }, [location]);

    useEffect(() => {
        const fetchRoom = async () => {
            if (!user?.id) return;
            try {
                const { data } = await api.get(`/api/room/${user.id}`);
                if (data.rooms && data.rooms.length > 0) {
                    setRoomId(data.rooms[0].id);
                }
            } catch (error) {
                console.error("ルーム一覧取得エラー:", error);
            }
        };
        fetchRoom();
    }, [user?.id]);

    const handleNavigation = (path: string) => {
        // 未認証ユーザーの場合
        if (!user) {
            // 現在のパスがmainstageまたはprofileの場合のみ、戻り先として保存
            if (
                location.pathname.startsWith("/mainstage/") ||
                location.pathname.startsWith("/profile/")
            ) {
                navigate("/login", {
                    state: { from: { pathname: location.pathname } },
                });
            } else {
                navigate("/login");
            }
            return;
        }

        // 認証済みユーザーの場合
        if (
            (path.includes("/studio/") || path.includes("/mainstage/")) &&
            !roomId
        ) {
            return;
        }
        navigate(path, { state: {} });
        setFromVisit(false);
    };

    return (
        <Paper
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: MENU_BAR_HEIGHT,
            }}
            elevation={3}
        >
            <BottomNavigation
                value={fromVisit ? "/visit" : location.pathname}
                onChange={(_, newValue) => {
                    handleNavigation(newValue);
                }}
                sx={{
                    "& .Mui-selected": {
                        borderBottom: "2px solid black",
                    },
                    "& .MuiBottomNavigationAction-root": {
                        minWidth: "auto",
                        padding: "6px 0 4px 0",
                    },
                }}
            >
                <BottomNavigationAction
                    value={`/mainstage/${roomId}`}
                    icon={
                        <div className="flex flex-col items-center">
                            <img
                                src="/icons/mainstage_black.png"
                                alt="Mainstage"
                                style={{ width: 32, height: 32 }}
                            />
                            <span style={labelStyle}>Display</span>
                        </div>
                    }
                />
                <BottomNavigationAction
                    value="/warehouse"
                    icon={
                        <div className="flex flex-col items-center">
                            <img
                                src="/icons/Warehouse_black.png"
                                alt="Warehouse"
                                style={{ width: 32, height: 32 }}
                            />
                            <span style={labelStyle}>Collection</span>
                        </div>
                    }
                />
                <BottomNavigationAction
                    value={`/studio/${roomId}`}
                    icon={
                        <div className="flex flex-col items-center">
                            <img
                                src="/icons/Studio_black.png"
                                alt="Studio"
                                style={{ width: 32, height: 32 }}
                            />
                            <span style={labelStyle}>Decorate</span>
                        </div>
                    }
                />
                <BottomNavigationAction
                    value="/visit"
                    icon={
                        <div className="flex flex-col items-center">
                            <img
                                src="/icons/Visit_black.png"
                                alt="Visit"
                                style={{ width: 32, height: 32 }}
                            />
                            <span style={labelStyle}>Explore</span>
                        </div>
                    }
                />
                <BottomNavigationAction
                    value={`/profile/${user?.id}`}
                    icon={
                        <div className="flex flex-col items-center">
                            <img
                                src="/icons/Profile_black.png"
                                alt="Profile"
                                style={{ width: 32, height: 32 }}
                            />
                            <span style={labelStyle}>Profile</span>
                        </div>
                    }
                />
            </BottomNavigation>
        </Paper>
    );
};

export default MenuBar;

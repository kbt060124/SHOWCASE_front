import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useAuth } from "@/utils/useAuth";
import api from "@/utils/axios";
import { useEffect, useState } from "react";

export const MENU_BAR_HEIGHT = 56;

const MenuBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [roomId, setRoomId] = useState<string>();

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
        if (
            (path.includes("/studio/") || path.includes("/mainstage/")) &&
            !roomId
        ) {
            return;
        }
        navigate(path);
    };

    return (
        <Paper
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: MENU_BAR_HEIGHT
            }}
            elevation={3}
        >
            <BottomNavigation
                value={location.pathname}
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
                        <img
                            src="/icons/mainstage_black.png"
                            alt="Mainstage"
                            style={{ width: 24, height: 24 }}
                        />
                    }
                />
                <BottomNavigationAction
                    value="/warehouse"
                    icon={
                        <img
                            src="/icons/Warehouse_black.png"
                            alt="Warehouse"
                            style={{ width: 24, height: 24 }}
                        />
                    }
                />
                <BottomNavigationAction
                    value={`/studio/${roomId}`}
                    icon={
                        <img
                            src="/icons/Studio_black.png"
                            alt="Studio"
                            style={{ width: 24, height: 24 }}
                        />
                    }
                />
                <BottomNavigationAction
                    value="/visit"
                    icon={
                        <img
                            src="/icons/Visit_black.png"
                            alt="Visit"
                            style={{ width: 24, height: 24 }}
                        />
                    }
                />
                <BottomNavigationAction
                    value={`/profile/${user?.id}`}
                    icon={
                        <img
                            src="/icons/Profile_black.png"
                            alt="Profile"
                            style={{ width: 24, height: 24 }}
                        />
                    }
                />
            </BottomNavigation>
        </Paper>
    );
};

export default MenuBar;

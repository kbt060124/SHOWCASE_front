import { useCallback, FC, useEffect, useState } from "react";
import SceneComponent from "../../components/SceneComponent";
import { studioSceneSetup } from "../../utils/studioSceneSetup";
import { Scene } from "@babylonjs/core";
import { useParams } from "react-router-dom";
import api from "../../axios";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

interface Profile {
    user_thumbnail: string;
    nickname: string;
}

interface User {
    profile: Profile;
}

interface RoomData {
    user: User;
    liked: any[];
    comments: any[];
}

const Studio: FC = () => {
    const { room_id } = useParams<{ room_id: string }>();
    const [roomData, setRoomData] = useState<RoomData | null>(null);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (room_id) {
                try {
                    const response = await api.get(
                        `/api/room/mainstage/${room_id}`
                    );
                    console.log("response.data.room", response.data.room);
                    setRoomData(response.data.room);
                } catch (error) {
                    console.error("Error fetching room data:", error);
                }
            }
        };

        fetchRoomData();
    }, [room_id]);

    const handleSceneReady = useCallback(
        (scene: Scene) => {
            if (room_id) {
                studioSceneSetup(scene, "/models/display_cabinet.glb", room_id);
            }
        },
        [room_id]
    );

    return (
        <div className="h-screen w-screen flex flex-col">
            <div className="w-full h-[calc(100vh-80px)]">
                <SceneComponent
                    antialias
                    onSceneReady={handleSceneReady}
                    id="studio-canvas"
                    className="w-full h-full"
                />
            </div>
            {roomData && roomData.user && roomData.user.profile && (
                <div className="h-20 flex items-center p-4 bg-white border-t">
                    <img
                        src={roomData.user.profile.user_thumbnail}
                        alt={roomData.user.profile.nickname}
                        className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                        <div className="font-bold">
                            {roomData.user.profile.nickname}
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex items-center gap-1">
                                <FavoriteIcon className="text-red-500" />
                                <span>{roomData.liked.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ChatBubbleIcon className="text-gray-500" />
                                <span>{roomData.comments.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Studio;

import { useCallback, FC, useEffect, useState } from "react";
import SceneComponent from "../../components/SceneComponent";
import { studioSceneSetup } from "../../utils/studioSceneSetup";
import { Scene } from "@babylonjs/core";
import { useAuth } from "../../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

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
    user_id: number;
}

const Mainstage: FC = () => {
    const { user } = useAuth();
    const { room_id } = useParams<{ room_id: string }>();
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [newComment, setNewComment] = useState<string>("");
    const [isCommentModalOpen, setIsCommentModalOpen] =
        useState<boolean>(false);
    const [isLikeModalOpen, setIsLikeModalOpen] = useState<boolean>(false);

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

    // いいね処理
    const handleLike = async (isLiked: boolean) => {
        try {
            if (!user) return;
            // 自分の投稿の場合は、いいねの表示切り替えのみ行う
            if (user.id === roomData?.user_id) {
                setIsLikeModalOpen(true);
                return;
            }

            if (isLiked) {
                await api.post(`/api/room/dislike/${room_id}`);
            } else {
                await api.post(`/api/room/like/${room_id}`);
            }

            const response = await api.get(`/api/room/mainstage/${room_id}`);
            setRoomData(response.data.room);
        } catch (error) {
            console.error("いいね処理に失敗しました:", error);
        }
    };

    const isLiked =
        roomData?.liked.some((like) => like.id === user?.id) ?? false;

    // コメント投稿処理
    const handleCommentSubmit = async (roomId: number) => {
        try {
            await api.post(`/api/room/comment/store/${roomId}`, {
                comment: newComment,
            });
            const response = await api.get(`/api/room/mainstage/${room_id}`);
            setRoomData(response.data.room);
            setNewComment("");
        } catch (error) {
            console.error("コメントの投稿に失敗しました:", error);
        }
    };

    // コメント削除処理
    const handleCommentDelete = async (commentId: number) => {
        try {
            if (!window.confirm("このコメントを削除してもよろしいですか？")) {
                return;
            }

            const response = await api.delete(
                `/api/room/comment/destroy/${commentId}`
            );

            if (response.status === 200) {
                const response = await api.get(
                    `/api/room/mainstage/${room_id}`
                );
                setRoomData(response.data.room);
                alert("コメントを削除しました");
            }
        } catch (error: any) {
            console.error("コメントの削除に失敗しました:", error);
            if (error.response?.status === 403) {
                alert("このコメントを削除する権限がありません");
            } else {
                alert("コメントの削除に失敗しました");
            }
        }
    };

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
                <>
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
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleLike(isLiked)}
                                >
                                    {user?.id === roomData?.user_id ? (
                                        roomData?.liked.length > 0 ? (
                                            <FavoriteIcon
                                                fontSize="small"
                                                className="text-red-500"
                                            />
                                        ) : (
                                            <FavoriteBorderIcon fontSize="small" />
                                        )
                                    ) : isLiked ? (
                                        <FavoriteIcon
                                            fontSize="small"
                                            className="text-red-500"
                                        />
                                    ) : (
                                        <FavoriteBorderIcon fontSize="small" />
                                    )}
                                    <span>{roomData?.liked.length}</span>
                                </div>
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => setIsCommentModalOpen(true)}
                                >
                                    <ChatBubbleOutlineIcon fontSize="small" />
                                    <span>{roomData.comments.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* コメントモーダル */}
                    {isCommentModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        コメント
                                    </h2>
                                    <button
                                        onClick={() =>
                                            setIsCommentModalOpen(false)
                                        }
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 mb-4">
                                    {roomData.comments.map((comment: any) => (
                                        <div
                                            key={comment.id}
                                            className="flex justify-between items-start"
                                        >
                                            <div>
                                                <div className="font-bold">
                                                    {
                                                        comment.user.profile
                                                            .nickname
                                                    }
                                                </div>
                                                <div>{comment.comment}</div>
                                            </div>
                                            {comment.user.id === user?.id && (
                                                <button
                                                    onClick={() =>
                                                        handleCommentDelete(
                                                            comment.id
                                                        )
                                                    }
                                                    className="text-red-500 text-sm"
                                                >
                                                    削除
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) =>
                                            setNewComment(e.target.value)
                                        }
                                        placeholder="コメントを入力..."
                                        className="flex-1 border rounded-lg px-3 py-2"
                                    />
                                    <button
                                        onClick={() =>
                                            handleCommentSubmit(Number(room_id))
                                        }
                                        disabled={!newComment.trim()}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                    >
                                        投稿
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* いいねリストモーダル */}
                    {isLikeModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        いいね一覧
                                    </h2>
                                    <button
                                        onClick={() =>
                                            setIsLikeModalOpen(false)
                                        }
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {roomData?.liked.map((like: any) => (
                                        <div
                                            key={like.id}
                                            className="flex items-center space-x-3 cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/profile/${like.profile.user_id}`
                                                )
                                            }
                                        >
                                            <img
                                                src={
                                                    like.profile.user_thumbnail
                                                }
                                                alt={like.profile.nickname}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <span className="font-medium">
                                                {like.profile.nickname}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Mainstage;

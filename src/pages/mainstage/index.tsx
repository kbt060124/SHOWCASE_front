import { useCallback, FC, useEffect, useState } from "react";
import SceneComponent from "../../components/SceneComponent";
import { studioSceneSetup } from "../../utils/studioSceneSetup";
import { Scene } from "@babylonjs/core";
import { useAuth } from "@/utils/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

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
            <div className="w-full h-[calc(100vh-56px)]">
                <SceneComponent
                    antialias
                    onSceneReady={handleSceneReady}
                    id="studio-canvas"
                    className="w-full h-full"
                />
            </div>
            {roomData && roomData.user && roomData.user.profile && (
                <>
                    <div
                        style={{ bottom: `${MENU_BAR_HEIGHT + 32}px` }}
                        className="absolute right-4 flex flex-col gap-2"
                    >
                        <div
                            className="flex flex-col items-center cursor-pointer p-2"
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
                            <span className="text-sm">
                                {roomData?.liked.length}
                            </span>
                        </div>
                        <div
                            className="flex flex-col items-center cursor-pointer p-2"
                            onClick={() => setIsCommentModalOpen(true)}
                        >
                            <ChatBubbleOutlineIcon fontSize="small" />
                            <span className="text-sm">
                                {roomData.comments.length}
                            </span>
                        </div>
                    </div>

                    {/* コメントモーダル */}
                    {isCommentModalOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[1001]"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setIsCommentModalOpen(false);
                                }
                            }}
                        >
                            <div className="bg-white rounded-t-lg p-6 w-full h-[50vh] overflow-y-auto mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold m-auto">
                                        Comments
                                    </h2>
                                </div>

                                <div className="space-y-4 mb-4">
                                    {roomData.comments.map((comment: any) => (
                                        <div
                                            key={comment.id}
                                            className="flex justify-between items-start"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        comment.user.profile
                                                            .user_thumbnail
                                                    }
                                                    alt={
                                                        comment.user.profile
                                                            .nickname
                                                    }
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-bold">
                                                        {
                                                            comment.user.profile
                                                                .nickname
                                                        }
                                                    </div>
                                                    <div>{comment.comment}</div>
                                                </div>
                                            </div>
                                            {comment.user.id === user?.id && (
                                                <button
                                                    onClick={() =>
                                                        handleCommentDelete(
                                                            comment.id
                                                        )
                                                    }
                                                    className="text-gray-400 hover:opacity-80"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 items-center">
                                    <img
                                        src={
                                            roomData.user.profile.user_thumbnail
                                        }
                                        alt={roomData.user.profile.nickname}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            placeholder="コメントを入力..."
                                            className="w-full border rounded-full px-4 py-2 pr-12"
                                        />
                                        <button
                                            onClick={() =>
                                                handleCommentSubmit(
                                                    Number(room_id)
                                                )
                                            }
                                            disabled={!newComment.trim()}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 disabled:text-gray-300"
                                        >
                                            <SendIcon fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* いいねリストモーダル */}
                    {isLikeModalOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[1001]"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setIsLikeModalOpen(false);
                                }
                            }}
                        >
                            <div className="bg-white rounded-t-lg p-6 w-full h-[50vh] overflow-y-auto mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold m-auto">
                                        Likes
                                    </h2>
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

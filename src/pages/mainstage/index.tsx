import { useCallback, FC, useEffect, useState, useRef } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";

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
    const [profile, setProfile] = useState<Profile | null>(null);
    const [hasItems, setHasItems] = useState(false);
    const sceneRef = useRef<Scene | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (room_id) {
                try {
                    const response = await api.get(
                        `/api/room/mainstage/${room_id}`
                    );
                    console.log("response.data.room", response.data.room);
                    setRoomData(response.data.room);
                    setHasItems(
                        response.data.room.items &&
                            response.data.room.items.length > 0
                    );
                } catch (error) {
                    console.error("Error fetching room data:", error);
                }
            }
            console.log(user);
        };
        fetchRoomData();
    }, [room_id]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    const response = await api.get(`/api/profile/${user.id}`);
                    setProfile(response.data.user.profile);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleSceneReady = useCallback(
        (scene: Scene) => {
            sceneRef.current = scene;
            if (room_id) {
                studioSceneSetup(scene, "/models/display_cabinet.glb", room_id)
                    .then(() => {
                        setIsLoading(false);
                    })
                    .catch((error) => {
                        console.error("Scene setup error:", error);
                        setIsLoading(false);
                    });
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

    // 他のユーザーの投稿かどうかを判定
    const isOtherUserPost = roomData && user?.id !== roomData.user_id;

    return (
        <div className="h-screen w-screen flex flex-col relative">
            {/* メインコンテンツ部分 */}
            <div
                className="w-full relative"
                style={{
                    height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`,
                }}
            >
                <SceneComponent
                    antialias
                    onSceneReady={handleSceneReady}
                    id="studio-canvas"
                    className="w-full h-full"
                />
                {!isOtherUserPost && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {isLoading ? (
                            <CircularProgress />
                        ) : !hasItems ? (
                            <button
                                onClick={() =>
                                    navigate(`/studio/${room_id}`, {
                                        state: { openWarehousePanel: true },
                                    })
                                }
                                className="transition-colors pointer-events-auto"
                                aria-label="倉庫を開く"
                            >
                                <img
                                    src="/images/add_KCGradation.png"
                                    alt=""
                                    className="w-12 h-12"
                                />
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            {/* 他のユーザーの投稿の場合のみヘッダーを表示 */}
            {isOtherUserPost && (
                <>
                    <div className="fixed top-0 left-0 right-0 h-12 min-h-[48px] flex items-center px-4 border-b bg-white z-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-2xl font-bold absolute left-4"
                        >
                            &#x3C;
                        </button>
                    </div>

                    {/* 所有者情報を表示 */}
                    <div
                        className="absolute left-0 right-0 h-16 min-h-[64px] flex items-center px-4 bg-white border-t z-50"
                        style={{ bottom: `${MENU_BAR_HEIGHT}px` }}
                        onClick={() => navigate(`/profile/${roomData.user_id}`)}
                    >
                        {roomData.user.profile.user_thumbnail ===
                        "default_thumbnail.png" ? (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <PersonIcon
                                    sx={{ fontSize: 24, color: "gray" }}
                                />
                            </div>
                        ) : (
                            <img
                                src={`${import.meta.env.VITE_S3_URL}/user/${
                                    roomData.user_id
                                }/${roomData.user.profile.user_thumbnail}`}
                                alt={roomData.user.profile.nickname}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        )}
                        <span className="font-bold ml-3">
                            {roomData.user.profile.nickname}
                        </span>
                    </div>
                </>
            )}

            {roomData && roomData.user && roomData.user.profile && (
                <>
                    <div
                        style={{ bottom: `${MENU_BAR_HEIGHT + 80}px` }}
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
                                                {comment.user.profile
                                                    .user_thumbnail ===
                                                "default_thumbnail.png" ? (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <PersonIcon
                                                            sx={{
                                                                fontSize: 24,
                                                                color: "gray",
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={`${
                                                            import.meta.env
                                                                .VITE_S3_URL
                                                        }/user/${
                                                            comment.user.id
                                                        }/${
                                                            comment.user.profile
                                                                .user_thumbnail
                                                        }`}
                                                        alt={
                                                            comment.user.profile
                                                                .nickname
                                                        }
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                )}
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
                                    {profile?.user_thumbnail ===
                                    "default_thumbnail.png" ? (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <PersonIcon
                                                sx={{
                                                    fontSize: 20,
                                                    color: "gray",
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            src={`${
                                                import.meta.env.VITE_S3_URL
                                            }/user/${user?.id}/${
                                                profile?.user_thumbnail
                                            }`}
                                            alt={profile?.nickname || ""}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
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
                                            {like.profile.user_thumbnail ===
                                            "default_thumbnail.png" ? (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <PersonIcon
                                                        sx={{
                                                            fontSize: 24,
                                                            color: "gray",
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <img
                                                    src={`${
                                                        import.meta.env
                                                            .VITE_S3_URL
                                                    }/user/${
                                                        like.profile.user_id
                                                    }/${
                                                        like.profile
                                                            .user_thumbnail
                                                    }`}
                                                    alt={like.profile.nickname}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            )}
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

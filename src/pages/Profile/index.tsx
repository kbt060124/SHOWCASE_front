import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";

interface Profile {
    nickname: string;
    last_name: string;
    first_name: string;
    user_thumbnail: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    profile: Profile;
}

interface Room {
    id: number;
    name: string;
    liked: User[];
    comments: {
        id: number;
        comment: string;
        user: User;
        created_at: string;
    }[];
    items: {
        id: number;
        name: string;
    }[];
    thumbnail?: string;
}

function Profile() {
    const { user_id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState<string>("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/profile/${user_id}`);
                setUser(response.data.user);
                setRooms(response.data.rooms);
            } catch (error) {
                console.error("プロフィールの取得に失敗しました:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user_id]);

    // いいね処理の追加
    const handleLike = async (roomId: number, isLiked: boolean) => {
        try {
            console.log("いいね処理を実行するルームID:", roomId);
            console.log(
                "現在のいいね状態:",
                isLiked ? "いいね済み" : "未いいね"
            );

            if (isLiked) {
                await api.post(`/api/room/dislike/${roomId}`);
            } else {
                await api.post(`/api/room/like/${roomId}`);
            }

            // いいね更新後にプロフィール情報を再取得
            const response = await api.get(`/api/profile/${user_id}`);
            setRooms(response.data.rooms);
        } catch (error) {
            console.error("いいね処理に失敗しました:", error);
        }
    };

    // コメント投稿処理
    const handleCommentSubmit = async (roomId: number) => {
        try {
            await api.post(`/api/room/comment/store/${roomId}`, {
                comment: newComment,
            });

            // コメント投稿後にプロフィール情報を再取得
            const response = await api.get(`/api/profile/${user_id}`);
            setRooms(response.data.rooms);
            setNewComment(""); // 入力フィールドをクリア
        } catch (error) {
            console.error("コメントの投稿に失敗しました:", error);
        }
    };

    // コメント削除処理
    const handleCommentDelete = async (commentId: number) => {
        try {
            // 削除の確認ダイアログを表示
            if (!window.confirm("このコメントを削除してもよろしいですか？")) {
                return;
            }

            // コメント削除APIを呼び出し
            const response = await api.delete(
                `/api/room/comment/destroy/${commentId}`
            );

            if (response.status === 200) {
                // 成功した場合、ルーム情報を再取得
                const updatedResponse = await api.get(
                    `/api/profile/${user_id}`
                );
                setRooms(updatedResponse.data.rooms);

                // 成功メッセージを表示（必要に応じて）
                alert("コメントを削除しました");
            }
        } catch (error: any) {
            console.error("コメントの削除に失敗しました:", error);

            // エラーメッセージを表示
            if (error.response?.status === 403) {
                alert("このコメントを削除する権限がありません");
            } else {
                alert("コメントの削除に失敗しました");
            }
        }
    };

    if (loading) {
        return <div>読み込み中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* プロフィールヘッダー */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-6">
                        <img
                            src={
                                user?.profile.user_thumbnail ||
                                "/default-avatar.png"
                            }
                            alt="プロフィール画像"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">
                                {user?.profile.nickname}
                            </h1>
                            <p className="text-gray-600">
                                {user?.profile.last_name}{" "}
                                {user?.profile.first_name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ルーム一覧 */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold mb-6">作成したルーム</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <a href={`/mainstage/${room.id}`}>
                                <img
                                    src={`${import.meta.env.VITE_S3_URL}/room/${
                                        user?.id
                                    }/${room.id}/${room.thumbnail}`}
                                    alt={`${room.name}のサムネイル`}
                                    className="w-full h-32 object-cover rounded-t-lg"
                                />
                            </a>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => {
                        // 現在のユーザーがいいねしているかチェック
                        const isLiked = room.liked.some(
                            (likedUser) => likedUser.id === user?.id
                        );

                        return (
                            <div
                                key={room.id}
                                className="bg-white rounded-lg shadow p-6"
                            >
                                <h3 className="text-lg font-semibold mb-4">
                                    {room.name}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <button
                                            onClick={() =>
                                                handleLike(room.id, isLiked)
                                            }
                                            className={`flex items-center space-x-1 ${
                                                isLiked
                                                    ? "text-pink-500"
                                                    : "text-gray-600 hover:text-pink-500"
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill={
                                                    isLiked
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            <span className="text-sm">
                                                いいね {room.liked.length}件
                                            </span>
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            コメント {room.comments.length}件
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            アイテム {room.items.length}個
                                        </p>
                                    </div>
                                </div>

                                {/* コメントセクション */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold mb-2">
                                        コメント
                                    </h4>
                                    {/* コメント入力フォーム */}
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            placeholder="コメントを入力..."
                                        />
                                        <button
                                            onClick={() =>
                                                handleCommentSubmit(room.id)
                                            }
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                                        >
                                            投稿
                                        </button>
                                    </div>

                                    {/* コメント一覧 */}
                                    <div className="space-y-2">
                                        {room.comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="flex justify-between items-start bg-gray-50 p-2 rounded hover:bg-gray-100"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {comment.user?.profile
                                                            ?.nickname ||
                                                            "不明なユーザー"}
                                                    </p>
                                                    <p className="text-sm">
                                                        {comment.comment}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(
                                                            comment.created_at
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                                {comment.user?.id ===
                                                    user?.id && (
                                                    <button
                                                        onClick={() =>
                                                            handleCommentDelete(
                                                                comment.id
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
                                                        title="コメントを削除"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Profile;

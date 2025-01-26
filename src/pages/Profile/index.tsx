import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";

interface Profile {
    nickname: string;
    last_name: string;
    first_name: string;
    user_thumbnail: string;
    attribute: string;
    birthday: string;
    gender: string;
    introduction: string | null;
    created_at: string;
}

interface User {
    id: number;
    profile: Profile;
}

interface Room {
    id: number;
    name: string;
    thumbnail?: string;
}

function Profile() {
    const { user_id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        nickname: "",
        last_name: "",
        first_name: "",
        attribute: "",
        introduction: "",
    });

    useEffect(() => {
        if (user?.profile) {
            setEditForm({
                nickname: user.profile.nickname,
                last_name: user.profile.last_name,
                first_name: user.profile.first_name,
                attribute: user.profile.attribute,
                introduction: user.profile.introduction || "",
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/profile/${user_id}`);
                console.log(response.data.user);
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

    const handleUpdate = async () => {
        try {
            const response = await api.put(
                `/api/profile/update/${user_id}`,
                editForm
            );
            setUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("プロフィールの更新に失敗しました:", error);
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <img
                                src={
                                    user?.profile.user_thumbnail ||
                                    "/default-avatar.png"
                                }
                                alt="プロフィール画像"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <div className="space-y-2">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-500">
                                                ニックネーム:
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.nickname}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        nickname:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500">
                                                姓:
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.last_name}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        last_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500">
                                                名:
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.first_name}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        first_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500">
                                                属性:
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.attribute}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        attribute:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500">
                                                自己紹介:
                                            </label>
                                            <textarea
                                                value={editForm.introduction}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        introduction:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold">
                                            {user?.profile.nickname}
                                        </h1>
                                        <p className="text-gray-600">
                                            {user?.profile.last_name}{" "}
                                            {user?.profile.first_name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            属性: {user?.profile.attribute}
                                        </p>
                                        {user?.profile.introduction && (
                                            <p className="text-sm text-gray-700">
                                                {user.profile.introduction}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <button
                                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                    onClick={handleUpdate}
                                >
                                    更新する
                                </button>
                                <button
                                    className="block w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                                    onClick={() => setIsEditing(false)}
                                >
                                    キャンセル
                                </button>
                            </div>
                        ) : (
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                onClick={() => setIsEditing(true)}
                            >
                                プロフィールを編集
                            </button>
                        )}
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
            </div>
        </div>
    );
}

export default Profile;

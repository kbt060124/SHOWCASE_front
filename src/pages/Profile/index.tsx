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
            </div>
        </div>
    );
}

export default Profile;

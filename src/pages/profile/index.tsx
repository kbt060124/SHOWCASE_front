import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axios";
import ImageCropper from "./components/ImageCropper";

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

interface EditForm {
    nickname: string;
    last_name: string;
    first_name: string;
    attribute: string;
    introduction: string;
    user_thumbnail?: Blob;
}

function Profile() {
    const { user_id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<EditForm>({
        nickname: "",
        last_name: "",
        first_name: "",
        attribute: "",
        introduction: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        if (user?.profile) {
            setEditForm({
                nickname: user.profile.nickname || "",
                last_name: user.profile.last_name || "",
                first_name: user.profile.first_name || "",
                attribute: user.profile.attribute || "",
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

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500); // 500ミリ秒のディレイ

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append("_method", "PUT"); // PUT メソッドをエミュレート
            formData.append("nickname", editForm.nickname);
            formData.append("last_name", editForm.last_name);
            formData.append("first_name", editForm.first_name);
            formData.append("attribute", editForm.attribute);
            formData.append("introduction", editForm.introduction);

            if (editForm.user_thumbnail) {
                formData.append(
                    "user_thumbnail",
                    editForm.user_thumbnail,
                    "profile.jpg"
                );
            }

            const response = await api.post(
                `/api/profile/update/${user_id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json",
                    },
                }
            );

            // レスポンスの詳細をログ出力
            console.log("更新レスポンス:", response);
            console.log("レスポンスデータ:", response.data);

            setUser(response.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error("プロフィールの更新に失敗しました:", error);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await api.get("/api/profile/search", {
                params: { query: searchQuery },
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("ユーザー検索に失敗しました:", error);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setEditForm((prev) => ({
            ...prev,
            user_thumbnail: croppedBlob,
        }));
        setIsCropping(false);
        setSelectedImage(null);
    };

    const handleEditClick = () => {
        if (user?.profile) {
            setEditForm({
                nickname: user.profile.nickname || "",
                last_name: user.profile.last_name || "",
                first_name: user.profile.first_name || "",
                attribute: user.profile.attribute || "",
                introduction: user.profile.introduction || "",
            });
        }
        setIsEditing(true);
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
                            <div className="relative">
                                <img
                                    src={
                                        editForm.user_thumbnail
                                            ? URL.createObjectURL(
                                                  editForm.user_thumbnail
                                              )
                                            : user?.profile.user_thumbnail &&
                                              user.profile.user_thumbnail !==
                                                  "default_thumbnail.png"
                                            ? `${
                                                  import.meta.env.VITE_S3_URL
                                              }/user/${user.id}/${
                                                  user.profile.user_thumbnail
                                              }`
                                            : "/default-avatar.png"
                                    }
                                    alt="プロフィール画像"
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-white"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </label>
                                )}
                            </div>
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
                        {!isEditing ? (
                            <button
                                onClick={handleEditClick}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                編集
                            </button>
                        ) : (
                            <div className="space-x-2">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                >
                                    更新する
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                >
                                    キャンセル
                                </button>
                            </div>
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
                                    }/${room.id}/thumbnail.png`}
                                    alt={`${room.name}のサムネイル`}
                                    className="w-full h-32 object-cover rounded-t-lg"
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* ユーザー検索セクション */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold mb-6">ユーザー検索</h2>
                <div className="mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ニックネームで検索"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* 検索結果 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((result) => (
                        <div
                            key={result.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <a
                                href={`/profile/${result.id}`}
                                className="flex items-center space-x-4"
                            >
                                <img
                                    src={
                                        result.profile?.user_thumbnail &&
                                        result.profile.user_thumbnail !==
                                            "default_thumbnail.png"
                                            ? `${
                                                  import.meta.env.VITE_S3_URL
                                              }/user/${result.id}/${
                                                  result.profile.user_thumbnail
                                              }`
                                            : "/default-avatar.png"
                                    }
                                    alt={`${result.profile?.nickname}のサムネイル`}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold">
                                        {result.profile?.nickname}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {result.profile?.last_name}{" "}
                                        {result.profile?.first_name}
                                    </p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {isCropping && (
                <ImageCropper
                    image={
                        selectedImage ||
                        user?.profile.user_thumbnail ||
                        "/default-avatar.png"
                    }
                    onCropComplete={handleCropComplete}
                    onCancel={() => setIsCropping(false)}
                />
            )}
        </div>
    );
}

export default Profile;

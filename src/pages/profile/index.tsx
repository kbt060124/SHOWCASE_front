import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axios";
import ImageCropper from "./components/ImageCropper";
import Header from "./components/Header";

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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [dummyRooms, setDummyRooms] = useState<
        { id: string; imageNumber: number }[]
    >([]);

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
        // 9個に満たない場合、ダミーの部屋を追加
        if (rooms.length < 9) {
            const dummyCount = 9 - rooms.length;
            const dummies = Array.from({ length: dummyCount }, (_, index) => ({
                id: `dummy-${index}`,
                imageNumber: (index % 8) + 1, // 1から8までの数字をループ
            }));
            setDummyRooms(dummies);
        } else {
            setDummyRooms([]);
        }
    }, [rooms]);

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
        <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
            <Header nickname={user?.profile.nickname}/>
            {/* プロフィールヘッダー */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-start space-x-4">
                    {/* プロフィール画像 */}
                    <div className="relative w-24 h-24">
                        <img
                            src={
                                editForm.user_thumbnail
                                    ? URL.createObjectURL(
                                          editForm.user_thumbnail
                                      )
                                    : user?.profile.user_thumbnail &&
                                      user.profile.user_thumbnail !==
                                          "default_thumbnail.png"
                                    ? `${import.meta.env.VITE_S3_URL}/user/${
                                          user.id
                                      }/${user.profile.user_thumbnail}`
                                    : "/default-avatar.png"
                            }
                            alt="プロフィール画像"
                            className="w-full h-full rounded-full object-cover"
                        />
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 cursor-pointer hover:bg-blue-600">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-white"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                                    <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </label>
                        )}
                    </div>

                    {/* プロフィール情報 */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-semibold">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.nickname}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    nickname: e.target.value,
                                                })
                                            }
                                            className="border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                                        />
                                    ) : (
                                        user?.profile.nickname
                                    )}
                                </h1>
                                {!isEditing && (
                                    <button
                                        onClick={handleEditClick}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                                            <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {isEditing && (
                                <div className="hidden sm:flex space-x-2">
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        保存
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:space-x-2">
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    last_name: e.target.value,
                                                })
                                            }
                                            className="border-b border-gray-300 focus:border-blue-500 focus:outline-none mb-2 sm:mb-0"
                                            placeholder="姓"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    first_name: e.target.value,
                                                })
                                            }
                                            className="border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                            placeholder="名"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.attribute}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                attribute: e.target.value,
                                            })
                                        }
                                        className="border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                                        placeholder="属性"
                                    />
                                    <textarea
                                        value={editForm.introduction}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                introduction: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none"
                                        rows={3}
                                        placeholder="自己紹介"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        {`${user?.profile.last_name} ${user?.profile.first_name}`}
                                    </p>
                                    {user?.profile.introduction && (
                                        <p className="text-gray-700">
                                            {user.profile.introduction}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* スマホ表示時の固定ボタン */}
            {isEditing && (
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                    <div className="flex space-x-2 max-w-7xl mx-auto">
                        <button
                            onClick={handleUpdate}
                            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            保存
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            )}

            {/* ギャラリーグリッド */}
            <div className="mt-8 grid grid-cols-3 gap-1">
                {/* 実際の部屋 */}
                {rooms.map((room) => (
                    <div key={room.id} className="aspect-square relative group">
                        <a href={`/mainstage/${room.id}`}>
                            <img
                                src={`${import.meta.env.VITE_S3_URL}/room/${
                                    user?.id
                                }/${room.id}/thumbnail.png`}
                                alt={`${room.name}のサムネイル`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </a>
                    </div>
                ))}

                {/* ダミーの部屋 */}
                {dummyRooms.map((dummy) => (
                    <div key={dummy.id} className="aspect-square relative">
                        <img
                            src={`/images/room/coming_soon${dummy.imageNumber}.png`}
                            alt="Coming Soon"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
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

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axios";
import ImageCropper from "./components/ImageCropper";
import Header from "./components/Header";
import { useAuth } from "@/utils/useAuth";
import VisitorView from "./components/VisitorView";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";

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

interface Warehouse {
    id: bigint;
    name: string;
    item_id: bigint;
    user_id: bigint;
    thumbnail: string;
    memo: string | null;
    total_size: number;
    filename: string;
    created_at: string | null;
    updated_at: string | null;
}

const getProfileImageUrl = (
    editFormThumbnail: Blob | undefined,
    user: User | null,
    isEditing: boolean
) => {
    // 編集モード中で、かつ新しい画像が設定されている場合
    if (isEditing && editFormThumbnail) {
        return URL.createObjectURL(editFormThumbnail);
    }

    // デフォルトサムネイルの場合
    if (
        !user?.profile.user_thumbnail ||
        user.profile.user_thumbnail === "default_thumbnail.png"
    ) {
        return "/images/user/default_thumbnail.png";
    }

    // S3の画像を表示
    return `${import.meta.env.VITE_S3_URL}/user/${user.id}/${
        user.profile.user_thumbnail
    }`;
};

const getProfileImageClasses = (
    editFormThumbnail: Blob | undefined,
    userThumbnail: string | undefined,
    isEditing: boolean
) => {
    const baseClasses = "w-full h-full rounded-full object-cover";

    // 編集モード中で新しい画像が設定されている場合は基本クラスのみ
    if (isEditing && editFormThumbnail) {
        return baseClasses;
    }

    // デフォルトサムネイルの場合のみ特別なスタイルを適用
    if (!userThumbnail || userThumbnail === "default_thumbnail.png") {
        return `${baseClasses} bg-gray-100 p-4`;
    }

    return baseClasses;
};

const Profile = () => {
    const { user_id } = useParams();
    const { user: currentUser } = useAuth();
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
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [thumbnailError, setThumbnailError] = useState<{
        [key: string]: boolean;
    }>({});

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

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await api.get(`/api/item/${user_id}`);
                setWarehouses(response.data);
            } catch (error) {
                console.error("倉庫データの取得に失敗しました:", error);
            }
        };

        fetchWarehouses();
    }, [user_id]);

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

    const handleThumbnailError = (roomId: number) => {
        setThumbnailError((prev) => ({
            ...prev,
            [roomId]: true,
        }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            ...editForm,
            user_thumbnail: undefined,
        });
    };

    // 自分のプロフィールかどうかを判定
    const isOwnProfile = currentUser?.id === Number(user_id);

    if (loading) {
        return <div>読み込み中...</div>;
    }

    return (
        <>
            {isOwnProfile ? (
                <div
                    className="bg-white relative"
                    style={{ paddingBottom: `${MENU_BAR_HEIGHT}px` }}
                >
                    <Header nickname={user?.profile.nickname} />
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex items-start space-x-4">
                            {/* プロフィール画像 */}
                            <div className="relative w-24 h-24 ml-2">
                                <img
                                    src={getProfileImageUrl(
                                        editForm.user_thumbnail,
                                        user,
                                        isEditing
                                    )}
                                    alt="プロフィール画像"
                                    className={getProfileImageClasses(
                                        editForm.user_thumbnail,
                                        user?.profile.user_thumbnail,
                                        isEditing
                                    )}
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
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-2">
                                        <h1 className="text-xl font-semibold">
                                            {isEditing ? (
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
                                </div>

                                {isEditing ? (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:space-x-2">
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
                                                    className="border-b border-gray-300 focus:border-blue-500 focus:outline-none mb-2 sm:mb-0"
                                                    placeholder="姓"
                                                />
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
                                                        attribute:
                                                            e.target.value,
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
                                                        introduction:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full h-24 border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none"
                                                placeholder="自己紹介"
                                            />
                                        </div>
                                    </>
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

                        {/* 保存・キャンセルボタン */}
                        {isEditing && (
                            <div className="flex justify-center space-x-4 my-8">
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-32"
                                >
                                    保存
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-32"
                                >
                                    キャンセル
                                </button>
                            </div>
                        )}

                        {/* ギャラリーグリッド */}
                        <div className="mt-8 grid grid-cols-3 gap-1">
                            {/* 実際の部屋 */}
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="aspect-square relative group"
                                >
                                    <a href={`/mainstage/${room.id}`}>
                                        <img
                                            src={
                                                thumbnailError[room.id]
                                                    ? "/images/room/default_thumbnail.png"
                                                    : `${
                                                          import.meta.env
                                                              .VITE_S3_URL
                                                      }/room/${user?.id}/${
                                                          room.id
                                                      }/thumbnail.png`
                                            }
                                            alt={`${room.name}のサムネイル`}
                                            className="w-full h-full object-cover"
                                            onError={() =>
                                                handleThumbnailError(room.id)
                                            }
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    </a>
                                </div>
                            ))}

                            {/* ダミーの部屋 */}
                            {dummyRooms.map((dummy) => (
                                <div
                                    key={dummy.id}
                                    className="aspect-square relative"
                                >
                                    <img
                                        src={`/images/room/coming_soon${dummy.imageNumber}.png`}
                                        alt="Coming Soon"
                                        className="w-full h-full object-cover"
                                    />
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
            ) : (
                // 他のユーザーのプロフィール表示
                <VisitorView
                    user={user}
                    rooms={rooms}
                    warehouses={warehouses}
                />
            )}
        </>
    );
};

export default Profile;

import React, { useEffect } from "react";
import { useAuth } from "@/utils/useAuth";
import api from "@/utils/axios";

interface UploadFormData {
    name: string;
    memo: string;
    thumbnail: File | null;
}

interface StoreProps {
    onSubmit: (data: UploadFormData) => void;
    thumbnail: File | null;
    filename: string;
}

const Store: React.FC<StoreProps> = ({ onSubmit, thumbnail, filename }) => {
    const { user } = useAuth();
    const [name, setName] = React.useState("GenerateModel");
    const [memo, setMemo] = React.useState("");
    const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        if (thumbnail) {
            const url = URL.createObjectURL(thumbnail);
            setThumbnailUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [thumbnail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // バリデーションチェック
        if (!name.trim()) {
            setError("名前を入力してください");
            return;
        }
        if (!thumbnail) {
            setError("サムネイルを選択してください");
            return;
        }

        setError(null);

        try {
            const formData = new FormData();
            formData.append("filename", filename);
            formData.append("user_id", user.id.toString());
            formData.append("name", name);
            formData.append("memo", memo);
            if (thumbnail) {
                formData.append("thumbnail", thumbnail);
            }

            // CSRFトークンを取得
            await api.get("/sanctum/csrf-cookie");

            // X-XSRF-TOKENヘッダーを設定
            const token = getCookie("XSRF-TOKEN");
            if (!token) {
                throw new Error("CSRFトークンが取得できませんでした");
            }

            const response = await api.post(
                "/api/item/rodin-upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json",
                        "X-XSRF-TOKEN": decodeURIComponent(token),
                    },
                }
            );

            if (response.data.item) {
                onSubmit({ name, memo, thumbnail });
            }
        } catch (error) {
            console.error("アップロードエラー:", error);
            setError("アップロードに失敗しました");
        }
    };

    // getCookie関数の追加
    const getCookie = (name: string): string => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(";").shift() || "";
        }
        return "";
    };

    return (
        <div className="w-full sm:w-72 lg:w-80 p-3 sm:p-4 rounded-lg shrink-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-700">Thumbnail</h3>
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt="新しいサムネイル"
                            className="mt-1 sm:mt-2 w-32 h-32 object-cover"
                        />
                    ) : (
                        <div className="mt-1 sm:mt-2 w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                            No thumbnail
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Name</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Memo</h3>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
                        rows={4}
                    />
                </div>
            </form>
        </div>
    );
};

export default Store;

import React, { useState } from "react";
import api from "@/utils/axios";

const Create3D: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState<string>("");
    const [subscriptionKey, setSubscriptionKey] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("images", selectedImage, selectedImage.name);
            formData.append("tier", "Sketch");

            const response = await api.post("/api/item/create-3d", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.taskId && response.data.subscriptionKey) {
                setTaskId(response.data.taskId);
                setSubscriptionKey(response.data.subscriptionKey);
                // ステータスチェックを開始
                checkStatus(response.data.subscriptionKey);
            }
        } catch (error) {
            console.error("Error:", error);
            setStatus("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async (subscriptionKey: string) => {
        try {
            const response = await api.post("/api/item/check-status", {
                subscriptionKey: subscriptionKey,
            });

            // エラーレスポンスの場合
            if (response.data.error) {
                setStatus(`エラー: ${response.data.message}`);
                return;
            }

            // ステータスが取得できた場合
            if (response.data.status) {
                setStatus(
                    `ステータス: ${response.data.status}${
                        response.data.message
                            ? ` - ${response.data.message}`
                            : ""
                    }`
                );

                // タスクが完了していない場合は5秒後に再度チェック
                if (
                    response.data.status !== "Done" &&
                    response.data.status !== "Failed" &&
                    response.data.status !== "Unknown"
                ) {
                    setTimeout(() => checkStatus(subscriptionKey), 5000);
                }

                // タスクが完了した場合の処理
                if (response.data.status === "Done") {
                    // TODO: 完了時の処理（例：結果のダウンロード）を実装
                    setStatus("生成が完了しました！");
                }
            } else {
                setStatus("ステータスが不明です");
            }
        } catch (error) {
            console.error("Status check error:", error);
            setStatus("ステータスチェックでエラーが発生しました");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">3Dモデル生成</h1>

            <div className="mb-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-2"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!selectedImage || loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    {loading ? "生成中..." : "3Dモデルを生成"}
                </button>
            </div>

            {status && (
                <div className="mt-4">
                    <h2 className="text-xl mb-2">ステータス</h2>
                    <p>{status}</p>
                </div>
            )}
        </div>
    );
};

export default Create3D;

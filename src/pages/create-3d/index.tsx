import React, { useState } from "react";
import api from "@/utils/axios";

const Create3D: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState<string>("");
    const [subscriptionKey, setSubscriptionKey] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [downloadUrls, setDownloadUrls] = useState<
        { url: string; name: string }[]
    >([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setDownloadUrls([]);
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
                checkStatus(
                    response.data.taskId,
                    response.data.subscriptionKey
                );
            }
        } catch (error) {
            console.error("Error:", error);
            setStatus("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async (taskId: string, subscriptionKey: string) => {
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
                    setTimeout(
                        () => checkStatus(taskId, subscriptionKey),
                        5000
                    );
                }

                // タスクが完了した場合の処理
                if (response.data.status === "Done") {
                    await handleDownload(taskId);
                }
            } else {
                setStatus("ステータスが不明です");
            }
        } catch (error) {
            console.error("Status check error:", error);
            setStatus("ステータスチェックでエラーが発生しました");
        }
    };

    const handleDownload = async (taskId: string) => {
        try {
            const response = await api.post("/api/item/download-model", {
                taskId: taskId,
            });

            if (response.data.files && response.data.files.length > 0) {
                setDownloadUrls(response.data.files);
                setStatus(
                    "生成が完了しました！ダウンロードリンクが利用可能です。"
                );
            } else {
                // エラーメッセージがある場合は表示
                const errorMessage = response.data.message
                    ? `${response.data.error} (${response.data.message})`
                    : response.data.error;
                setStatus(
                    errorMessage ||
                        "生成は完了しましたが、ダウンロード可能なファイルが見つかりません。"
                );

                // まだ生成中の場合は再度チェック
                if (
                    response.data.status &&
                    response.data.status !== "Done" &&
                    response.data.status !== "Failed"
                ) {
                    setTimeout(() => handleDownload(taskId), 5000);
                }
            }
        } catch (error) {
            console.error("Download error:", error);
            setStatus("ダウンロードの準備中にエラーが発生しました");

            // 5秒後に再試行
            setTimeout(() => handleDownload(taskId), 5000);
        }
    };

    const downloadFile = async (url: string, filename: string) => {
        try {
            setStatus("ファイルをダウンロード中...");
            const response = await api.post(
                "/api/item/proxy-download",
                {
                    url: url,
                    filename: filename,
                },
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/octet-stream",
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            setStatus("ダウンロードが完了しました！");
        } catch (error) {
            console.error("File download error:", error);
            setStatus(
                "ファイルのダウンロード中にエラーが発生しました。再試行してください。"
            );
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

            {downloadUrls.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl mb-2">ダウンロード</h2>
                    <div className="flex flex-col gap-2">
                        {downloadUrls.map((file, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    downloadFile(file.url, file.name)
                                }
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                {file.name}をダウンロード
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Create3D;

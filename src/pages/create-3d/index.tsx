import React, { useState } from "react";
import api from "@/utils/axios";
import PreviewModal from "@/pages/create-3d/components/PreviewModal";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";

const Create3D: React.FC = () => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [downloadUrls, setDownloadUrls] = useState<
        { url: string; name: string; path: string }[]
    >([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFilename, setPreviewFilename] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                alert("画像は最大5枚までアップロードできます");
                return;
            }
            setSelectedImages(files);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (selectedImages.length === 0) {
            alert("画像を1枚以上選択してください");
            return;
        }

        if (selectedImages.length > 5) {
            alert("画像は最大5枚までアップロードできます");
            return;
        }

        setLoading(true);
        setDownloadUrls([]);
        try {
            const formData = new FormData();
            selectedImages.forEach((image) => {
                formData.append("images[]", image);
            });
            formData.append("tier", "Sketch");

            const response = await api.post("/api/item/create-3d", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.taskId && response.data.subscriptionKey) {
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
                    "生成が完了しました！ファイルがサーバーに保存されました。"
                );
            } else {
                // エラーメッセージがある場合は表示
                const errorMessage = response.data.message
                    ? `${response.data.error} (${response.data.message})`
                    : response.data.error;
                setStatus(
                    errorMessage ||
                        "生成は完了しましたが、ファイルが見つかりません。"
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

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-white p-4"
            style={{
                paddingBottom: `calc(${MENU_BAR_HEIGHT}px + 1rem)`,
            }}
        >
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2">
                    Generate
                </h1>
                <h2 className="text-2xl font-bold text-center mb-8">
                    3D Models from Images
                </h2>

                <div className="flex justify-center items-center space-x-4 mb-8">
                    <img
                        src="/images/image_black.png"
                        alt="Image icon"
                        className="w-16 h-16"
                    />
                    <span className="text-3xl">→</span>
                    <img
                        src="/images/3dMode_black.png"
                        alt="3D Model icon"
                        className="w-16 h-16"
                    />
                </div>

                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <img
                                src="/images/add_KCGradation.png"
                                alt="Upload icon"
                                className="w-10 h-10 mb-3"
                            />
                            <p className="mb-2 text-sm text-gray-500">
                                Upload Images (Max 5)
                            </p>
                        </div>
                    </label>
                </div>

                {selectedImages.length > 0 && (
                    <div className="mt-4">
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `repeat(${selectedImages.length}, 1fr)`,
                                gap: "0.5rem",
                            }}
                        >
                            {selectedImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square"
                                >
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? "生成中..." : "3Dモデルを生成"}
                        </button>
                    </div>
                )}

                {status && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{status}</p>
                    </div>
                )}

                {downloadUrls.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold mb-2">
                            生成されたファイル
                        </h2>
                        <div className="space-y-2">
                            {downloadUrls.map((file, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            {file.name}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                onClick={() => {
                                                    const filename = file.path
                                                        .split("/")
                                                        .pop();
                                                    if (filename) {
                                                        setPreviewFilename(
                                                            filename
                                                        );
                                                        setIsPreviewOpen(true);
                                                    }
                                                }}
                                            >
                                                プレビュー
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                filename={previewFilename}
            />
        </div>
    );
};

export default Create3D;

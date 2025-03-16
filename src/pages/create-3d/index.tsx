import React, { useState, useEffect } from "react";
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
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);
    const [previewFilename, setPreviewFilename] = useState("f9924e19-ca57-4f1a-a214-89fb952e5aa8_model.glb");

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
            setLoading(false);
        }
    };

    // ステータスに応じたメッセージを返す関数を修正
    const getStatusMessage = (status: string) => {
        switch (status) {
            case "Generating":
                return "3D model is being generated";
            case "Queued":
                return "3D model generation is queued";
            case "Processing":
                return "3D model is being generated";
            case "Done":
                return "3D model has been stored on the server";
            case "Failed":
                return "Failed to generate 3D model";
            case "Unknown":
                return "Status is unknown";
            default:
                return status;
        }
    };

    // checkStatus関数の修正
    const checkStatus = async (taskId: string, subscriptionKey: string) => {
        try {
            const response = await api.post("/api/item/check-status", {
                subscriptionKey: subscriptionKey,
                taskId: taskId,
            });

            // レスポンスの内容を確認するログを追加
            console.log("Status response:", response.data);

            // エラーレスポンスの場合
            if (response.data.error) {
                setStatus(response.data.error);
                setLoading(false);
                return;
            }

            // ステータスが取得できた場合
            if (response.data.status) {
                // 受け取ったステータスを確認するログを追加
                console.log("Received status:", response.data.status);
                setStatus(response.data.status);

                // タスクが完了していない場合は5秒後に再度チェック
                if (
                    response.data.status !== "Done" &&
                    response.data.status !== "Failed" &&
                    response.data.status !== "Unknown" &&
                    ["Generating", "Queued", "Processing"].includes(
                        response.data.status
                    )
                ) {
                    setTimeout(
                        () => checkStatus(taskId, subscriptionKey),
                        5000
                    );
                    return;
                }

                // タスクが完了し、かつダウンロードURLが含まれている場合
                if (
                    response.data.status === "Done" &&
                    response.data.downloadUrls
                ) {
                    setDownloadUrls(response.data.downloadUrls);
                    setLoading(false);
                    return;
                }

                // Done状態だがダウンロードURLがない場合
                if (response.data.status === "Done") {
                    setLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error("Status check error:", error);
            setStatus("Unknown");
            setTimeout(() => checkStatus(taskId, subscriptionKey), 5000);
        }
    };

    // PreviewModalを自動的に表示するための副作用を追加
    useEffect(() => {
        if (downloadUrls.length > 0) {
            const filename = downloadUrls[0].path.split("/").pop();
            if (filename) {
                setPreviewFilename(filename);
                setIsPreviewOpen(true);
            }
        }
    }, [downloadUrls]);

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-white p-4"
            style={{
                paddingBottom: `calc(${MENU_BAR_HEIGHT}px + 1rem)`,
            }}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-8">
                        Generating 3D Model...
                    </h1>
                    <div className="flex flex-col items-center justify-center mb-8">
                        <img
                            src="/images/generating_black.png"
                            alt="Generating icon"
                            className="w-16 h-16 mb-8"
                        />
                        <p className="text-center text-gray-600 mb-4">
                            One Moment Please
                        </p>
                        {status && (
                            <p className="text-sm text-gray-600">
                                {getStatusMessage(status)}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                // 通常の表示（既存のコンテンツ）
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
                </div>
            )}

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                filename={previewFilename}
            />
        </div>
    );
};

export default Create3D;

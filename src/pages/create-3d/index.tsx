import React, { useState, useEffect } from "react";
import api from "@/utils/axios";
import PreviewModal from "@/pages/create-3d/components";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";
import { useNavigate } from "react-router-dom";

const Create3D: React.FC = () => {
    const navigate = useNavigate();
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [downloadUrls, setDownloadUrls] = useState<
        { url: string; name: string; path: string }[]
    >([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFilename, setPreviewFilename] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [waitingCount, setWaitingCount] = useState(0);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = selectedImages.length + files.length;

            if (totalImages > 5) {
                alert("You can upload up to 5 images");
                return;
            }

            setSelectedImages((prev) => [...prev, ...files]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (selectedImages.length === 0) {
            alert("Please select at least one image");
            return;
        }

        if (selectedImages.length > 5) {
            alert("You can upload up to 5 images");
            return;
        }

        setLoading(true);
        setDownloadUrls([]);
        setStatus("Start");
        setError(null);
        setWaitingCount(0);

        try {
            // 1. 背景削除処理
            const removeBackgroundFormData = new FormData();
            selectedImages.forEach((image) => {
                removeBackgroundFormData.append("images[]", image);
            });

            const removeBackgroundResponse = await api.post(
                "/api/item/remove-background",
                removeBackgroundFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (removeBackgroundResponse.data.error) {
                setError(removeBackgroundResponse.data.error);
                setLoading(false);
                return;
            }

            setStatus(removeBackgroundResponse.data.status);

            // 2. 3Dモデル生成処理
            const create3DResponse = await api.post(
                "/api/item/create-3d",
                {
                    filenames: removeBackgroundResponse.data.processed_images,
                    tier: "Sketch",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // 3. ステータスチェック開始
            if (
                create3DResponse.data.taskId &&
                create3DResponse.data.subscriptionKey
            ) {
                checkStatus(
                    create3DResponse.data.taskId,
                    create3DResponse.data.subscriptionKey
                );
            } else {
                throw new Error("Failed to generate. Please try again");
            }
        } catch (error: any) {
            console.error("Error:", error);

            if (error.response) {
                // サーバーからのエラーレスポンス
                setError(
                    error.response.data?.error ||
                        "Failed to generate. Please try again"
                );
            } else if (error.request) {
                // リクエストは送信されたがレスポンスが受信されなかった
                setError("No response from server");
            } else {
                // その他のエラー
                setError(
                    error.message || "Failed to generate. Please try again"
                );
            }

            setLoading(false);
        }
    };

    // ステータスに応じたメッセージを返す関数を修正
    const getStatusMessage = (status: string) => {
        switch (status) {
            case "Start":
                return "Step 1 of 3 - Removing Background";
            case "Removed":
                return "Step 2 of 3 - Generating 3D Model";
            case "Generating":
                return "Step 2 of 3 - Generating 3D Model";
            case "Queued":
                return "Step 2 of 3 - Generating 3D Model";
            case "Processing":
                return "Step 3 of 3 - Almost there! Finalizing";
            case "Done":
                return "Step 3 of 3 - Almost there! Finalizing";
            case "Waiting":
                return "Everyone is generating! Please hold";
            case "Failed":
                return "Failed to generate. Please try again";
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
                setError(response.data.error);
                setLoading(false);
                return;
            }

            // ステータスが取得できた場合
            if (response.data.status) {
                // 受け取ったステータスを確認するログを追加
                console.log("Received status:", response.data.status);
                setStatus(response.data.status);

                // Waitingステータスのカウント処理
                if (response.data.status === "Waiting") {
                    setWaitingCount(prev => prev + 1);
                    if (waitingCount >= 12) { // 13回目でエラー
                        setError("Failed to generate. Please try again");
                        setLoading(false);
                        setWaitingCount(0);
                        return;
                    }
                } else {
                    setWaitingCount(0); // Waiting以外のステータスの場合はカウントをリセット
                }
                
                // Failedの場合はエラーを設定
                if (response.data.status === "Failed") {
                    setError("Failed to generate. Please try again");
                    setLoading(false);
                    return;
                }

                // タスクが完了していない場合は5秒後に再度チェック
                if (
                    response.data.status !== "Done" &&
                    response.data.status !== "Failed" &&
                    response.data.status !== "Unknown" &&
                    ["Generating", "Queued", "Processing", "Waiting"].includes(
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
        } catch (error: any) {
            console.error("Status check error:", error);
            setStatus("Unknown");
            setTimeout(() => checkStatus(taskId, subscriptionKey), 5000);
            if (error.response) {
                setError(
                    error.response.data?.error ||
                        "An error occurred while checking status"
                );
            } else if (error.request) {
                setError("No response from server");
            } else {
                setError(
                    error.message || "An error occurred while checking status"
                );
            }
            setLoading(false);
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

    // 戻るボタンのハンドラーを追加
    const handleBack = () => {
        setError(null);
        setLoading(false);
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-white p-4"
            style={{
                paddingBottom: `calc(${MENU_BAR_HEIGHT}px + 1rem)`,
            }}
        >
            {/* 戻るボタンの条件を変更 */}
            {!loading && !error ? (
                <button
                    onClick={() => navigate("/warehouse")}
                    className="absolute left-4 top-4 text-2xl font-bold"
                >
                    &#x3C;
                </button>
            ) : error ? (
                <button
                    onClick={handleBack}
                    className="absolute left-4 top-4 text-2xl font-bold"
                >
                    &#x3C;
                </button>
            ) : null}
            {loading || error ? (
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
                        {error ? (
                            <p className="text-sm text-[#8C252B]">{error}</p>
                        ) : (
                            status && (
                                <p className="text-sm text-[#11529A]">
                                    {getStatusMessage(status)}
                                </p>
                            )
                        )}
                    </div>
                </div>
            ) : (
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

                    {selectedImages.length > 0 ? (
                        <div className="mt-16">
                            <div className="grid grid-cols-5 gap-4">
                                {selectedImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square"
                                    >
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center"
                                        >
                                            <img
                                                src="/images/regenerate.png"
                                                alt="Remove"
                                                className="w-full h-full"
                                            />
                                        </button>
                                    </div>
                                ))}
                                {selectedImages.length < 5 && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload-additional"
                                        />
                                        <label
                                            htmlFor="image-upload-additional"
                                            className="aspect-square flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                        >
                                            <span className="text-4xl text-gray-400 hover:text-gray-600 transition-colors">
                                                +
                                            </span>
                                        </label>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-16 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {loading ? "Generating..." : "Generate"}
                            </button>
                        </div>
                    ) : (
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
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 ">
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


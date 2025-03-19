import React, { useState } from "react";
import GenerateViewer from "@/components/preview/GenerateViewer";
import Store from "./Store";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    filename: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
    isOpen,
    onClose,
    filename,
}) => {
    const [store, setStore] = useState(false);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleStoreSubmit = () => {
        // アップロード成功後にwarehouseページに遷移
        navigate("/warehouse");
    };

    return (
        <div
            className="fixed inset-0 bg-white flex flex-col"
            style={{ zIndex: 1100 }}
        >
            {/* ヘッダー部分 */}
            <div className="h-12 min-h-[48px] flex items-center px-4 border-b relative">
                <button
                    onClick={onClose}
                    className="text-2xl font-bold absolute left-4"
                >
                    &#x3C;
                </button>
                <h1 className="text-lg font-bold flex-1 text-center">
                    {store ? "UPLOAD" : "PREVIEW"}
                </h1>
                {store && (
                    <div className="absolute right-4 w-[48px] text-center">
                        <button
                            onClick={() => {
                                const formElement =
                                    document.querySelector("form");
                                if (formElement) {
                                    formElement.requestSubmit();
                                }
                            }}
                            className="text-[#11529A] hover:opacity-80 text-sm"
                        >
                            Store
                        </button>
                    </div>
                )}
            </div>
            {/* コンテンツ部分 */}
            <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                <GenerateViewer
                    filename={filename}
                    onCaptureScreenshot={setThumbnail}
                    store={store}
                />
                {store ? (
                    <Store
                        onSubmit={handleStoreSubmit}
                        thumbnail={thumbnail}
                        filename={filename}
                    />
                ) : (
                    <div className="flex justify-center gap-16 p-4 mt-12">
                        <div className="flex flex-col items-center">
                            <button
                                onClick={async () => {
                                    try {
                                        // GLBファイルを削除
                                        await api.post(
                                            "/api/item/delete-generated-model",
                                            {
                                                filename: filename,
                                            }
                                        );
                                        onClose();
                                    } catch (error) {
                                        console.error(
                                            "GLBファイルの削除に失敗しました:",
                                            error
                                        );
                                    }
                                }}
                            >
                                <img
                                    src="/images/regenerate.png"
                                    alt="Try Again"
                                    className="w-12 h-12"
                                />
                            </button>
                            <span className="text-sm text-gray-600">
                                Try Again
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <button onClick={() => setStore(true)}>
                                <img
                                    src="/images/accept.png"
                                    alt="Accept"
                                    className="w-12 h-12"
                                />
                            </button>
                            <span className="text-sm text-gray-600">
                                Accept
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewModal;

import React, { useState } from "react";
import { ModalProps } from "./types";
import CloseButton from "./CloseButton";
import InfoPanel from "./InfoPanel";
import ModelViewer from "./ModelViewer";
import Form from "./Form";
import api from "../../axios";

const Modal: React.FC<ModalProps> = ({ warehouse, onClose }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [thumbnail, setThumbnail] = useState<File | null>(null);

    const handleSubmit = async (formData: {
        name: string;
        memo: string;
        thumbnail: File | null;
    }) => {
        try {
            const submitData = new FormData();
            submitData.append("_method", "PUT");
            submitData.append("name", formData.name);
            submitData.append("memo", formData.memo);
            if (formData.thumbnail) {
                submitData.append("thumbnail", formData.thumbnail);
            }

            // FormDataの内容を確認
            console.log("FormData contents:");
            for (const pair of submitData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const response = await api.post(
                `/api/item/update/${warehouse.id}`,
                submitData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("API Response:", response.data);

            if (response.data.success) {
                setIsEditMode(false);
                onClose(); // モーダルを閉じる
                window.location.reload(); // 画面を更新
            }
        } catch (error) {
            console.error("更新に失敗しました:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-h-[95vh] flex flex-col relative">
                <CloseButton onClose={onClose} />
                <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                    <ModelViewer
                        warehouse={warehouse}
                        isEditMode={isEditMode}
                        onCaptureScreenshot={setThumbnail}
                    />
                    {isEditMode ? (
                        <Form
                            warehouse={warehouse}
                            onSubmit={handleSubmit}
                            thumbnail={thumbnail}
                            onCancel={() => setIsEditMode(false)}
                        />
                    ) : (
                        <InfoPanel
                            warehouse={warehouse}
                            onEdit={() => setIsEditMode(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;

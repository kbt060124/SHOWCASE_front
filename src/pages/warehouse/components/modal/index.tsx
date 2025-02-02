import React, { useState } from "react";
import CloseButton from "@/pages/warehouse/components/modal/CloseButton";
import InfoPanel from "@/pages/warehouse/components/modal/InfoPanel";
import S3Viewer from "@/components/preview/S3Viewer";
import Form from "@/pages/warehouse/components/modal/Form";
import api from "@/utils/axios";

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

interface ModalProps {
    warehouse: Warehouse;
    onClose: () => void;
    onDelete: (id: bigint) => void;
    onUpdate: (updatedWarehouse: Warehouse) => void;
}

const Modal: React.FC<ModalProps> = ({
    warehouse,
    onClose,
    onDelete,
    onUpdate,
}) => {
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

            const response = await api.post(
                `/api/item/update/${warehouse.id}`,
                submitData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                onUpdate(response.data.item); // 更新されたデータを親コンポーネントに渡す
                setIsEditMode(false);
                onClose();
            }
        } catch (error) {
            console.error("更新に失敗しました:", error);
            alert("更新に失敗しました");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("このアイテムを削除してもよろしいですか？")) {
            return;
        }

        try {
            const response = await api.delete(
                `/api/item/destroy/${warehouse.id}`
            );
            if (response.status === 200) {
                onDelete(warehouse.id); // 親コンポーネントに削除を通知
                onClose(); // モーダルを閉じる
            }
        } catch (error) {
            console.error("削除に失敗しました:", error);
            alert("削除に失敗しました");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-h-[95vh] flex flex-col relative">
                <CloseButton onClose={onClose} />
                <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                    <S3Viewer
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
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;

import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import CloseIcon from "@mui/icons-material/Close";
import S3Viewer from "../../components/preview/S3Viewer";

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

interface WarehousePanelProps {
    onModelSelect: (modelPath: string, itemId: bigint) => void;
    onClose: () => void;
}

const WarehousePanel: React.FC<WarehousePanelProps> = ({
    onModelSelect,
    onClose,
}) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] =
        useState<Warehouse | null>(null);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const userId = 1;
                const response = await api.get<Warehouse[]>(
                    `/api/item/${userId}`
                );
                setWarehouses(response.data);
                // デフォルトで最初のモデルを選択
                if (response.data.length > 0) {
                    setSelectedWarehouse(response.data[0]);
                }
            } catch (error) {
                console.error(
                    "倉庫データの取得中にエラーが発生しました:",
                    error
                );
            }
        };

        fetchWarehouses();
    }, []);

    const handleThumbnailClick = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
    };

    const handleAddToStudio = () => {
        if (selectedWarehouse) {
            const modelPath = `${import.meta.env.VITE_S3_URL}/warehouse/${
                selectedWarehouse.user_id
            }/${selectedWarehouse.id}/${selectedWarehouse.filename}`;
            onModelSelect(modelPath, selectedWarehouse.id);
            onClose();
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">倉庫</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAddToStudio}
                        disabled={!selectedWarehouse}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Studioに配置
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="閉じる"
                    >
                        <CloseIcon />
                    </button>
                </div>
            </div>
            {selectedWarehouse && (
                <div className="mb-4 h-[300px]">
                    <S3Viewer warehouse={selectedWarehouse} />
                </div>
            )}
            <div className="grid grid-cols-4 gap-4 overflow-y-auto flex-1">
                {warehouses.map((warehouse) => (
                    <div
                        key={warehouse.id}
                        onClick={() => handleThumbnailClick(warehouse)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <img
                            src={`${import.meta.env.VITE_S3_URL}/warehouse/${
                                warehouse.user_id
                            }/${warehouse.id}/${warehouse.thumbnail}`}
                            alt={warehouse.name}
                            className="w-full object-cover rounded-lg shadow-md"
                        />
                        <p className="mt-2 text-sm font-medium">
                            {warehouse.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WarehousePanel;

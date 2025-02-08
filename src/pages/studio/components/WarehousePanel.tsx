import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import CloseIcon from "@mui/icons-material/Close";
import S3Viewer from "@/components/preview/S3Viewer";

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
        <div className="h-full flex flex-col">
            <div className="h-12 min-h-[48px] flex items-center px-4 border-b relative">
                <button
                    onClick={onClose}
                    className="text-2xl font-bold absolute left-4"
                >
                    &#x3C;
                </button>
                <h1 className="text-lg font-bold flex-1 text-center">
                    WAREHOUSE
                </h1>
                <div className="absolute right-4 w-[48px] text-center">
                    <button
                        onClick={handleAddToStudio}
                        disabled={!selectedWarehouse}
                        className="text-[#11529A] hover:opacity-80 text-sm disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </div>
            {selectedWarehouse && (
                <div className="h-[300px] border-b">
                    <S3Viewer warehouse={selectedWarehouse} />
                </div>
            )}
            <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-4 gap-4">
                    {warehouses.map((warehouse) => (
                        <div
                            key={warehouse.id}
                            onClick={() => handleThumbnailClick(warehouse)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img
                                src={`${
                                    import.meta.env.VITE_S3_URL
                                }/warehouse/${warehouse.user_id}/${
                                    warehouse.id
                                }/${warehouse.thumbnail}`}
                                alt={warehouse.name}
                                className="w-full object-cover shadow-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WarehousePanel;

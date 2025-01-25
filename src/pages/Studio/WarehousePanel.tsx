import React, { useEffect, useState } from "react";
import api from "../../axios";
import { type Warehouse } from "../../components/Modal/types";

interface WarehousePanelProps {
    onModelSelect: (modelPath: string, itemId: bigint) => void;
    onClose: () => void;
}

const WarehousePanel: React.FC<WarehousePanelProps> = ({
    onModelSelect,
    onClose,
}) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const userId = 1;
                const response = await api.get<Warehouse[]>(
                    `http://localhost/api/item/${userId}`
                );
                setWarehouses(response.data);
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
        const modelPath = `${import.meta.env.VITE_S3_URL}/warehouse/${
            warehouse.user_id
        }/${warehouse.id}/${warehouse.filename}`;
        onModelSelect(modelPath, warehouse.id);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">倉庫</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="閉じる"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
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

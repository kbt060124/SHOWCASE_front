import React, { useState } from "react";
import axios from "../../axios";
import { Warehouse } from "./types";

interface InfoPanelProps {
    warehouse: Warehouse;
    onUpdate?: (updatedWarehouse: Warehouse) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ warehouse, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(warehouse.name);
    const [memo, setMemo] = useState(warehouse.memo || "");

    const formatDate = (dateString: string | null) => {
        return dateString
            ? new Date(dateString).toLocaleDateString("ja-JP")
            : "日時不明";
    };

// axiosのインスタンスを作成し、ベースURLを設定
const api = axios.create({
    baseURL: 'http://localhost:8000',  // LaravelのURLに合わせて変更してください
    headers: {
        'Content-Type': 'application/json',
    }
});

const handleSubmit = async () => {
    try {
        const response = await api.put<Warehouse>(
            `/api/warehouses/${warehouse.id}`,
            {
                name,
                memo,
            }
        );

        if (onUpdate) {
            onUpdate(response.data);
        }
        setIsEditing(false);
    } catch (error) {
        console.error("更新中にエラーが発生しました:", error);
    }
};
    return (
        <div className="w-full sm:w-72 lg:w-80 p-3 sm:p-4 bg-gray-50 rounded-lg shrink-0">
            <div className="space-y-3 sm:space-y-4">
                <div>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">名前</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-blue-600 text-sm hover:text-blue-700"
                        >
                            {isEditing ? "キャンセル" : "編集"}
                        </button>
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-2 py-1 border rounded"
                        />
                    ) : (
                        <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                            {name}
                        </p>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">詳細情報</h3>
                    {isEditing ? (
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="mt-1 w-full px-2 py-1 border rounded"
                            rows={3}
                        />
                    ) : (
                        <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                            {memo || "メモはありません"}
                        </p>
                    )}
                </div>
                {isEditing && (
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        保存
                    </button>
                )}
                <div>
                    <h3 className="font-semibold text-gray-700">作成日時</h3>
                    <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                        {formatDate(warehouse.created_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoPanel;

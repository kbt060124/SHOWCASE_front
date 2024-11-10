import React from "react";
import { Warehouse } from "./types";

interface InfoPanelProps {
    warehouse: Warehouse;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ warehouse }) => {
    const formatDate = (dateString: string | null) => {
        return dateString
            ? new Date(dateString).toLocaleDateString("ja-JP")
            : "日時不明";
    };

    return (
        <div className="w-full sm:w-72 lg:w-80 p-3 sm:p-4 bg-gray-50 rounded-lg shrink-0">
            <div className="space-y-3 sm:space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-700">名前</h3>
                    <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                        {warehouse.name}
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">詳細情報</h3>
                    <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                        {warehouse.memo || "メモはありません"}
                    </p>
                </div>
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

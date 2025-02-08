import React from "react";

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

interface ItemProps {
    warehouse: Warehouse | null;
}

const Item: React.FC<ItemProps> = ({ warehouse }) => {
    if (!warehouse) return null;

    return (
        <div className="w-full px-4 pt-2 pb-4 bg-white">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold">{warehouse.name}</h2>
                    <p className="text-gray-600">{warehouse.memo || ""}</p>
                </div>
            </div>
        </div>
    );
};

export default Item;

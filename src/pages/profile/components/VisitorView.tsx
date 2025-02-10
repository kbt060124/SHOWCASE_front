import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Viewer from "@/pages/warehouse/components/viewer";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";

interface User {
    id: number;
    profile: {
        nickname: string | null;
        last_name: string | null;
        first_name: string | null;
        introduction: string | null;
        user_thumbnail: string | null;
        attribute: string | null;
    };
}

interface Room {
    id: number;
    name: string;
}

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

interface VisitorViewProps {
    user: User | null;
    rooms: Room[];
    warehouses: Warehouse[];
}

const VisitorView = ({ user, rooms, warehouses }: VisitorViewProps) => {
    const navigate = useNavigate();
    const [selectedWarehouse, setSelectedWarehouse] =
        useState<Warehouse | null>(null);

    if (!user) return null;

    const handleRoomClick = (roomId: number) => {
        navigate(`/mainstage/${roomId}`, { state: { fromVisit: true } });
    };

    const handleWarehouseClick = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
    };

    return (
        <div
            className="bg-white"
            style={{ paddingBottom: `${MENU_BAR_HEIGHT}px` }}
        >
            {/* メインの部屋サムネイル */}
            {rooms.length > 0 && (
                <div
                    className="w-full aspect-square md:aspect-[2/1] relative cursor-pointer"
                    onClick={() => handleRoomClick(rooms[0].id)}
                >
                    <img
                        src={`${import.meta.env.VITE_S3_URL}/room/${user.id}/${
                            rooms[0].id
                        }/thumbnail.png`}
                        alt={`${rooms[0].name}のサムネイル`}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* プロフィール情報 */}
            <div className="p-6">
                <div className="flex items-center space-x-4">
                    <img
                        src={
                            user.profile?.user_thumbnail &&
                            user.profile.user_thumbnail !==
                                "default_thumbnail.png"
                                ? `${import.meta.env.VITE_S3_URL}/user/${
                                      user.id
                                  }/${user.profile.user_thumbnail}`
                                : "/default-avatar.png"
                        }
                        alt="プロフィール画像"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-xl font-bold">
                            {user.profile?.nickname || ""}
                        </h1>
                        <p className="text-gray-600">
                            {user.profile?.last_name || ""}{" "}
                            {user.profile?.first_name || ""}
                        </p>
                        <p className="text-gray-600 mt-2">
                            {user.profile?.introduction || ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Warehouseアイテム一覧 */}
            <div>
                <div className="grid grid-cols-3 gap-1">
                    {warehouses.map((warehouse) => (
                        <div
                            key={warehouse.id.toString()}
                            className="aspect-square relative cursor-pointer"
                            onClick={() => handleWarehouseClick(warehouse)}
                        >
                            <img
                                src={`${
                                    import.meta.env.VITE_S3_URL
                                }/warehouse/${warehouse.user_id.toString()}/${warehouse.id.toString()}/${
                                    warehouse.thumbnail
                                }`}
                                alt={warehouse.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Warehouse Viewer */}
            {selectedWarehouse && (
                <Viewer
                    warehouse={selectedWarehouse}
                    onClose={() => setSelectedWarehouse(null)}
                    onDelete={() => {}}
                    onUpdate={() => {}}
                />
            )}
        </div>
    );
};

export default VisitorView;

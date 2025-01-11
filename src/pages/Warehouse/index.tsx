import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../axios";
import Modal from "../../components/Modal";

interface Warehouse {
    id: bigint;
    user_id: bigint;
    item_id: bigint;
    name: string;
    thumbnail: string;
    favorite: boolean;
    memo: string | null;
    created_at: string | null;
    updated_at: string | null;
}

function getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || "";
    }
    return "";
}

function Warehouse() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] =
        useState<Warehouse | null>(null);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                // ユーザーIDを適切な方法で取得してください
                const userId = 1;
                const response = await axios.get<Warehouse[]>(
                    `http://localhost/api/item/${userId}`
                );
                setWarehouses(response.data);
                console.log("取得した倉庫データ:", response.data);
            } catch (error) {
                console.error(
                    "倉庫データの取得中にエラーが発生しました:",
                    error
                );
            }
        };

        fetchWarehouses();
    }, []);

    const openModal = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
    };

    const closeModal = () => {
        setSelectedWarehouse(null);
    };

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", "1");
        formData.append("name", file.name.replace(".glb", ""));

        try {
            // CSRFトークンを取得
            await api.get("/sanctum/csrf-cookie");

            // X-XSRF-TOKENヘッダーを設定
            const token = getCookie("XSRF-TOKEN");
            if (!token) {
                throw new Error("CSRFトークンが取得できませんでした");
            }

            const response = await api.post("/api/item/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                    "X-XSRF-TOKEN": decodeURIComponent(token),
                },
            });

            if (response.data.item) {
                setWarehouses((prev) => [...prev, response.data.item]);
            }
        } catch (error) {
            console.error("アップロードエラー:", error);
        }
    };

    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-between item-center mb-4">
                <h1 className="text-2xl font-bold">Warehouse</h1>
                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
                    <input
                        type="file"
                        className="hidden"
                        accept=".glb"
                        onChange={handleFileUpload}
                    />
                    <span className="text-xl">+</span>
                </label>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
                {warehouses.map((warehouse) => (
                    <div
                        key={warehouse.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                        onClick={() => openModal(warehouse)}
                    >
                        <img
                            src={`https://test-fbx-upload.s3.ap-southeast-2.amazonaws.com/${warehouse.thumbnail}`}
                            alt={warehouse.name}
                            className="w-full h-24 sm:h-32 object-cover"
                        />
                        <div className="p-2 sm:p-3">
                            <h2 className="text-sm sm:text-base font-semibold truncate">
                                {warehouse.name}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {selectedWarehouse && (
                <Modal warehouse={selectedWarehouse} onClose={closeModal} />
            )}
        </div>
    );
}

export default Warehouse;

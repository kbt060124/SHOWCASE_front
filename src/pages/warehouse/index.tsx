import { useEffect, useState } from "react";
import UploadForm from "@/pages/warehouse/components/upload";
import Modal from "@/pages/warehouse/components/modal";
import { useAuth } from "@/utils/useAuth";
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
    const { user } = useAuth();
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false);

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

    useEffect(() => {
        const fetchWarehouses = async () => {
            if (!user) return;
            try {
                const response = await api.get(`/api/item/${user.id}`);
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
    }, [user]);

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

        if (file.size > MAX_FILE_SIZE) {
            alert("ファイルサイズが100MBを超えています");
            return;
        }

        setUploadFile(file);
        setIsUploadPreviewOpen(true);

        // input要素の値をリセット
        event.target.value = "";
    };

    const handleUploadSubmit = async (formData: FormData) => {
        try {
            // FormDataの内容を確認
            const file = formData.get("file");
            if (!file) {
                throw new Error("ファイルが選択されていません");
            }

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
            setUploadFile(null);
            setIsUploadPreviewOpen(false);
        } catch (error) {
            console.error("アップロードエラー:", error);
        }
    };

    const handleDelete = (deletedId: bigint) => {
        setWarehouses((prevWarehouses) =>
            prevWarehouses.filter((warehouse) => warehouse.id !== deletedId)
        );
    };

    const handleUpdate = (updatedWarehouse: Warehouse) => {
        // 更新されたデータで配列を更新
        setWarehouses((prevWarehouses) =>
            prevWarehouses.map((warehouse) =>
                warehouse.id === updatedWarehouse.id
                    ? {
                          ...updatedWarehouse,
                          thumbnail: `${
                              updatedWarehouse.thumbnail
                          }?t=${Date.now()}`, // キャッシュバスティング
                      }
                    : warehouse
            )
        );
        // 選択中のWarehouseも更新
        setSelectedWarehouse({
            ...updatedWarehouse,
            thumbnail: `${updatedWarehouse.thumbnail}?t=${Date.now()}`,
        });
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
                            src={`${import.meta.env.VITE_S3_URL}/warehouse/${
                                warehouse.user_id
                            }/${warehouse.id}/${warehouse.thumbnail}`}
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
                <Modal
                    warehouse={selectedWarehouse}
                    onClose={closeModal}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                />
            )}

            {uploadFile && (
                <UploadForm
                    isOpen={isUploadPreviewOpen}
                    onClose={() => setIsUploadPreviewOpen(false)}
                    file={uploadFile}
                    onSubmit={handleUploadSubmit}
                />
            )}
        </div>
    );
}

export default Warehouse;

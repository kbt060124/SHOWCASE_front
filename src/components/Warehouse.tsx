import React, { useEffect, useState } from "react";
import axios from "axios";

interface Warehouse {
    id: number;
    name: string;
    thumbnail: string;
}

function Warehouse() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                // ユーザーIDを適切な方法で取得してください
                const userId = 1;
                const response = await axios.get<Warehouse[]>(
                    `http://localhost/api/warehouses/user/${userId}`
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

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Warehouse</h1>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
                {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            src={`https://test-fbx-upload.s3.ap-southeast-2.amazonaws.com/${warehouse.thumbnail}`}
                            alt={warehouse.name}
                            className="w-full h-24 sm:h-32 object-cover"
                        />
                        <div className="p-2 sm:p-3">
                            <h2 className="text-sm sm:text-base font-semibold truncate">{warehouse.name}</h2>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Warehouse;

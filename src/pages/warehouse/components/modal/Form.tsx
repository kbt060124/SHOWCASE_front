import React, { useEffect } from "react";

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

interface FormProps {
    warehouse: Warehouse;
    onSubmit: (data: {
        name: string;
        memo: string;
        thumbnail: File | null;
    }) => void;
    thumbnail: File | null;
    onCancel: () => void;
}

const Form: React.FC<FormProps> = ({
    warehouse,
    onSubmit,
    thumbnail,
    onCancel,
}) => {
    const [name, setName] = React.useState(warehouse.name);
    const [memo, setMemo] = React.useState(warehouse.memo || "");
    const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);

    useEffect(() => {
        if (thumbnail) {
            const url = URL.createObjectURL(thumbnail);
            setThumbnailUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [thumbnail]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, memo, thumbnail });
    };

    return (
        <div className="w-full sm:w-72 lg:w-80 p-3 sm:p-4 rounded-lg shrink-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-700">Thumbnail</h3>
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt="新しいサムネイル"
                            className="mt-1 sm:mt-2 w-32 h-32 object-cover"
                        />
                    ) : (
                        <img
                            src={`${import.meta.env.VITE_S3_URL}/warehouse/${
                                warehouse.user_id
                            }/${warehouse.id}/${warehouse.thumbnail}`}
                            alt="現在のサムネイル"
                            className="mt-1 sm:mt-2 w-32 h-32 object-cover"
                        />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Name</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
                        required
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Memo</h3>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
                        rows={4}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    >
                        更新
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Form;

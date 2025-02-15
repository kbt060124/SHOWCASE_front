import React, { useEffect } from "react";

interface UploadFormData {
    name: string;
    memo: string;
    thumbnail: File | null;
}

interface StoreProps {
    initialName: string;
    onSubmit: (data: UploadFormData) => void;
    thumbnail: File | null;
}

const Store: React.FC<StoreProps> = ({ initialName, onSubmit, thumbnail }) => {
    const [name, setName] = React.useState(initialName);
    const [memo, setMemo] = React.useState("");
    const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);

    useEffect(() => {
        if (thumbnail) {
            const url = URL.createObjectURL(thumbnail);
            setThumbnailUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
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
                        <div className="mt-1 sm:mt-2 w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                            No thumbnail
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Name</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
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
            </form>
        </div>
    );
};

export default Store;

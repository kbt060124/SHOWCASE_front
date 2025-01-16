import React from "react";
import { UploadFormData } from "./types";

interface FormProps {
    initialName: string;
    onSubmit: (data: UploadFormData) => void;
}

const Form: React.FC<FormProps> = ({ initialName, onSubmit }) => {
    const [name, setName] = React.useState(initialName);
    const [memo, setMemo] = React.useState("");
    const [thumbnail, setThumbnail] = React.useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, memo, thumbnail });
    };

    return (
        <div className="w-full sm:w-72 lg:w-80 p-3 sm:p-4 bg-gray-50 rounded-lg shrink-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-700">サムネイル</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setThumbnail(e.target.files?.[0] || null)
                        }
                        className="mt-1 sm:mt-2 block w-full text-sm"
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">名前</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
                        required
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">メモ</h3>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="mt-1 sm:mt-2 block w-full rounded-md border-gray-300"
                        rows={4}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                    アップロード
                </button>
            </form>
        </div>
    );
};

export default Form;

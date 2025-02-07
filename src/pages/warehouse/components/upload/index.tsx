import React from "react";
import BinaryViewer from "@/components/preview/BinaryViewer";
import Store from "@/pages/warehouse/components/upload/Store";
import { useAuth } from "@/utils/useAuth";

interface UploadModalProps {
    file: File;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
}

interface UploadFormData {
    name: string;
    memo: string;
    thumbnail: File | null;
}

const Upload: React.FC<UploadModalProps> = ({
    file,
    onClose,
    onSubmit,
    isOpen,
}) => {
    const { user } = useAuth();
    const [thumbnail, setThumbnail] = React.useState<File | null>(null);

    // モーダルが閉じられた時にサムネイルをリセットする
    React.useEffect(() => {
        if (!isOpen) {
            setThumbnail(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (formData: UploadFormData) => {
        if (!user) return;
        const submitData = new FormData();

        // デバッグログを追加
        console.log("送信前のデータ確認:", {
            file,
            userId: user.id,
            name: formData.name,
            memo: formData.memo,
            thumbnail: formData.thumbnail,
        });

        submitData.append("file", file);
        submitData.append("user_id", user.id.toString());
        submitData.append("name", formData.name);
        submitData.append("memo", formData.memo);
        if (formData.thumbnail) {
            submitData.append("thumbnail", formData.thumbnail);
        }

        // FormDataの内容を確認
        console.log("FormDataの内容:");
        for (const pair of submitData.entries()) {
            console.log(pair[0], pair[1]);
        }

        onSubmit(submitData);
    };

    return (
        <div
            className="fixed inset-0 bg-white flex flex-col"
            style={{ zIndex: 1100 }}
        >
            {/* ヘッダー部分 */}
            <div className="h-12 min-h-[48px] flex items-center px-4 border-b relative">
                <button
                    onClick={onClose}
                    className="text-2xl font-bold absolute left-4"
                >
                    &#x3C;
                </button>
                <h1 className="text-lg font-bold flex-1 text-center">
                    WAREHOUSE
                </h1>
                <div className="absolute right-4 w-[48px] text-center">
                    <button
                        onClick={() => {
                            const formElement = document.querySelector("form");
                            if (formElement) {
                                formElement.requestSubmit();
                            }
                        }}
                        className="text-[#11529A] hover:opacity-80 text-sm"
                    >
                        Store
                    </button>
                </div>
            </div>

            {/* コンテンツ部分 */}
            <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                <div className="flex-1">
                    <BinaryViewer
                        file={file}
                        onCaptureScreenshot={setThumbnail}
                    />
                </div>
                <div className="flex-1">
                    <Store
                        initialName={file.name.replace(".glb", "")}
                        onSubmit={handleSubmit}
                        thumbnail={thumbnail}
                    />
                </div>
            </div>
        </div>
    );
};

export default Upload;

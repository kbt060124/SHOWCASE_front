import React from "react";
import CloseButton from "../modal/CloseButton";
import BinaryViewer from "@/components/preview/BinaryViewer";
import Form from "@/pages/warehouse/components/upload/Form";
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

const UploadModal: React.FC<UploadModalProps> = ({
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-h-[95vh] flex flex-col relative">
                <CloseButton onClose={onClose} />
                <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                    <BinaryViewer
                        file={file}
                        onCaptureScreenshot={setThumbnail}
                    />
                    <Form
                        initialName={file.name.replace(".glb", "")}
                        onSubmit={handleSubmit}
                        thumbnail={thumbnail}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadModal;

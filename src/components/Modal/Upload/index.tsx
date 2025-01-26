import React from "react";
import { UploadModalProps, UploadFormData } from "./types";
import CloseButton from "../CloseButton";
import Preview from "./Preview";
import Form from "./Form";
import { useAuth } from "../../../hooks/useAuth";

const UploadModal: React.FC<UploadModalProps> = ({
    file,
    onClose,
    onSubmit,
    isOpen,
}) => {
    const { user } = useAuth();
    const [thumbnail, setThumbnail] = React.useState<File | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (formData: UploadFormData) => {
        if (!user) return;
        const submitData = new FormData();
        submitData.append("file", file);
        submitData.append("user_id", user.id.toString());
        submitData.append("name", formData.name);
        submitData.append("memo", formData.memo);
        if (formData.thumbnail) {
            submitData.append("thumbnail", formData.thumbnail);
        }
        onSubmit(submitData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-h-[95vh] flex flex-col relative">
                <CloseButton onClose={onClose} />
                <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                    <Preview file={file} onCaptureScreenshot={setThumbnail} />
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

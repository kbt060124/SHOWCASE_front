import React from "react";
import GenerateViewer from "@/components/preview/GenerateViewer";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    filename: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
    isOpen,
    onClose,
    filename,
}) => {
    if (!isOpen) return null;

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
                    プレビュー
                </h1>
            </div>

            {/* コンテンツ部分 */}
            <div className="flex-grow overflow-auto p-4">
                <GenerateViewer filename={filename} />
            </div>
        </div>
    );
};

export default PreviewModal;

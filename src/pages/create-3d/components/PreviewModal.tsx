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
                <h1 className="text-lg font-bold flex-1 text-center">
                    PREVIEW
                </h1>
            </div>
            {/* コンテンツ部分 */}
            <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                <GenerateViewer filename={filename} />
                <div className="flex justify-center gap-16 p-4 mt-12">
                    <div className="flex flex-col items-center">
                        <button onClick={onClose}>
                            <img
                                src="/images/regenerate.png"
                                alt="Try Again"
                                className="w-12 h-12"
                            />
                        </button>
                        <span className="text-sm text-gray-600">Try Again</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button>
                            <img
                                src="/images/accept.png"
                                alt="Accept"
                                className="w-12 h-12"
                            />
                        </button>
                        <span className="text-sm text-gray-600">Accept</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;

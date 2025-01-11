import React from "react";
import { ModalProps } from "./types";
import CloseButton from "./CloseButton";
import InfoPanel from "./InfoPanel";
import ModelViewer from "./ModelViewer";

const Modal: React.FC<ModalProps> = ({ warehouse, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-h-[95vh] flex flex-col relative">
                <CloseButton onClose={onClose} />
                <div className="flex-grow flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-auto">
                    <ModelViewer
                        itemId={warehouse.id}
                        warehouseId={warehouse.id}
                    />
                    <InfoPanel warehouse={warehouse} />
                </div>
            </div>
        </div>
    );
};

export default Modal;

import React from 'react';

interface ModalProps {
    warehouse: {
        name: string;
        thumbnail: string;
    };
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ warehouse, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-2">{warehouse.name}</h2>
                <img
                    src={`https://test-fbx-upload.s3.ap-southeast-2.amazonaws.com/${warehouse.thumbnail}`}
                    alt={warehouse.name}
                    className="w-full h-64 object-cover mb-4"
                />
                <button
                    onClick={onClose}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
};

export default Modal;


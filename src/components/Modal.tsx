import React from 'react';
import SceneComponent from './SceneComponent';
import { setupWarehouseScene } from '../utils/sceneSetup';

interface ModalProps {
    warehouse: {
        id: number;
        name: string;
        item_id: number;
    };
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ warehouse, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="閉じる"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold mb-2 pr-8">{warehouse.name}</h2>
                <div className="flex-grow overflow-hidden">
                    <SceneComponent
                        antialias
                        onSceneReady={(scene) => setupWarehouseScene(scene, `https://test-fbx-upload.s3.ap-southeast-2.amazonaws.com/${warehouse.item_id}.glb`)}
                        id={`canvas-${warehouse.id}`}
                        className="w-full h-full min-h-[200px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default Modal;

import React, { useState, useCallback, FC } from "react";
import SceneComponent from "../../components/SceneComponent";
import { studioSceneSetup } from "../../utils/studioSceneSetup";
import { Scene } from "@babylonjs/core";
import WarehousePanel from "./WarehousePanel";

const Studio: FC = () => {
    const [sceneRef, setSceneRef] = useState<Scene | null>(null);
    const [isWarehousePanelOpen, setIsWarehousePanelOpen] = useState(false);

    const handleSceneReady = useCallback((scene: Scene) => {
        setSceneRef(scene);
        studioSceneSetup(scene);
    }, []);

    const handleModelSelect = (modelPath: string) => {
        if (sceneRef) {
            studioSceneSetup(sceneRef, modelPath);
        }
    };

    const handleClickOutside = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsWarehousePanelOpen(false);
        }
    };

    return (
        <div className="h-screen w-screen flex">
            {isWarehousePanelOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={handleClickOutside}
                >
                    <div className="absolute left-0 top-0 w-1/3 h-full bg-white border-r border-gray-200 overflow-y-auto">
                        <WarehousePanel
                            onModelSelect={handleModelSelect}
                            onClose={() => setIsWarehousePanelOpen(false)}
                        />
                    </div>
                </div>
            )}
            <div className="w-full relative">
                {!isWarehousePanelOpen && (
                    <div className="absolute bottom-4 left-4 z-10">
                        <button
                            onClick={() => setIsWarehousePanelOpen(true)}
                            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white/90 transition-colors"
                            aria-label="倉庫を開く"
                        >
                            <img
                                src="/images/warehouse-icon.png"
                                alt=""
                                className="w-6 h-6"
                            />
                        </button>
                    </div>
                )}
                <SceneComponent
                    antialias
                    onSceneReady={handleSceneReady}
                    id="studio-canvas"
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};

export default Studio;

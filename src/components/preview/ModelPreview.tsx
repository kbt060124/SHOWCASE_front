import React, { useRef, useState, useEffect } from "react";
import SceneComponent from "@/components/SceneComponent";
import { Scene } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { setupUploadScene } from "../../utils/sceneSetup";
import api from "@/utils/axios";

interface ModelPreviewProps {
    filename: string;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ filename }) => {
    const [modelData, setModelData] = useState<ArrayBuffer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const [canvasHeight, setCanvasHeight] = useState<number>(0);

    useEffect(() => {
        const calculateHeight = () => {
            const vh = window.innerHeight;
            setCanvasHeight(Math.round(vh * 0.6));
        };

        calculateHeight();
        window.addEventListener("resize", calculateHeight);

        return () => {
            window.removeEventListener("resize", calculateHeight);
        };
    }, []);

    useEffect(() => {
        const loadModel = async () => {
            try {
                const response = await api.get(
                    `/api/item/preview-model/${filename}`,
                    {
                        responseType: "arraybuffer",
                    }
                );

                const arrayBuffer = response.data;
                const uint8Array = new Uint8Array(arrayBuffer);
                const magic = String.fromCharCode(...uint8Array.slice(0, 4));

                if (magic !== "glTF") {
                    setError("無効なGLBファイルです");
                    return;
                }

                setModelData(arrayBuffer);
                setError(null);
            } catch (error) {
                setError("モデルの読み込みに失敗しました");
                console.error("Model loading error:", error);
            }
        };

        loadModel();

        return () => {
            if (sceneRef.current) {
                sceneRef.current.dispose();
                sceneRef.current = null;
            }
        };
    }, [filename]);

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="w-full">
            {modelData && (
                <SceneComponent
                    antialias
                    onSceneReady={(scene) => {
                        sceneRef.current = scene;
                        setupUploadScene(scene, modelData);
                    }}
                    id="model-preview"
                    height={`${canvasHeight}px`}
                    className="w-full h-full"
                />
            )}
        </div>
    );
};

export default ModelPreview;

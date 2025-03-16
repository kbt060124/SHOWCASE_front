import React, { useRef, useState, useEffect } from "react";
import SceneComponent from "@/components/SceneComponent";
import { Scene, Engine } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { setupUploadScene } from "../../utils/sceneSetup";
import api from "@/utils/axios";

interface GenerateViewerProps {
    filename: string;
    onCaptureScreenshot?: (screenshot: File) => void;
    store: boolean;
}

const GenerateViewer: React.FC<GenerateViewerProps> = ({
    filename,
    onCaptureScreenshot,
    store,
}) => {
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

    const handleCaptureScreenshot = () => {
        if (!sceneRef.current || !onCaptureScreenshot) return;

        const engine = sceneRef.current.getEngine() as Engine;
        const canvas = engine.getRenderingCanvas();

        if (canvas) {
            const offscreenCanvas = document.createElement("canvas");
            const targetSize = 1024;

            // アスペクト比を計算
            const aspectRatio = canvas.width / canvas.height;

            if (aspectRatio > 1) {
                offscreenCanvas.width = targetSize;
                offscreenCanvas.height = Math.round(targetSize / aspectRatio);
            } else {
                offscreenCanvas.height = targetSize;
                offscreenCanvas.width = Math.round(targetSize * aspectRatio);
            }

            const ctx = offscreenCanvas.getContext("2d");

            if (ctx) {
                sceneRef.current.render();

                ctx.drawImage(
                    canvas,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                    0,
                    0,
                    offscreenCanvas.width,
                    offscreenCanvas.height
                );

                offscreenCanvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File([blob], "thumbnail.png", {
                                type: "image/png",
                            });
                            onCaptureScreenshot(file);
                        }
                    },
                    "image/png",
                    0.95
                );
            }
        }
    };

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="w-full">
            {modelData && (
                <>
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
                    {store && onCaptureScreenshot && (
                        <div className="px-4 pt-2">
                            <button
                                onClick={handleCaptureScreenshot}
                                className="text-[#11529A] hover:opacity-80 text-sm"
                            >
                                Set current view as thumbnail
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GenerateViewer;

import React, { useRef, useState, useEffect } from "react";
import SceneComponent from "@/components/SceneComponent";
import { Scene, Engine } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { setupUploadScene } from "../../utils/sceneSetup";

interface BinaryViewerProps {
    file: File;
    onCaptureScreenshot: (screenshot: File) => void;
}

const BinaryViewer: React.FC<BinaryViewerProps> = ({
    file,
    onCaptureScreenshot,
}) => {
    const [modelData, setModelData] = useState<ArrayBuffer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const [canvasHeight, setCanvasHeight] = useState<number>(0);

    useEffect(() => {
        const calculateHeight = () => {
            // ビューポートの高さの60%を計算
            const vh = window.innerHeight;
            setCanvasHeight(Math.round(vh * 0.6));
        };

        // 初回計算
        calculateHeight();

        // リサイズイベントのリスナーを追加
        window.addEventListener("resize", calculateHeight);

        // クリーンアップ
        return () => {
            window.removeEventListener("resize", calculateHeight);
        };
    }, []);

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target?.result instanceof ArrayBuffer) {
                const uint8Array = new Uint8Array(e.target.result);
                const magic = String.fromCharCode(...uint8Array.slice(0, 4));
                if (magic !== "glTF") {
                    console.error("無効なGLBファイルです");
                    return;
                }
                setModelData(e.target.result);
            }
        };
        reader.readAsArrayBuffer(file);

        return () => {
            if (sceneRef.current) {
                sceneRef.current.dispose();
                sceneRef.current = null;
            }
        };
    }, [file]);

    const handleCaptureScreenshot = () => {
        if (!sceneRef.current) return;

        const engine = sceneRef.current.getEngine() as Engine;
        const canvas = engine.getRenderingCanvas();

        if (canvas) {
            const offscreenCanvas = document.createElement("canvas");
            const targetSize = 1024;

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

    return (
        <>
            {modelData && (
                <SceneComponent
                    antialias
                    onSceneReady={(scene) => {
                        sceneRef.current = scene;
                        setupUploadScene(scene, modelData);
                    }}
                    id="upload-preview"
                    height={`${canvasHeight}px`}
                    className="w-full h-full"
                />
            )}
            <div className="px-4 pt-2">
                <button
                    onClick={handleCaptureScreenshot}
                    className="text-[#11529A] hover:opacity-80 text-sm"
                >
                    Set current view as thumbnail
                </button>
            </div>
        </>
    );
};

export default BinaryViewer;

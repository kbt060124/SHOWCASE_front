import React, { useRef } from "react";
import SceneComponent from "@/components/SceneComponent";
import { setupWarehouseScene } from "@/utils/sceneSetup";
import { Scene, Engine } from "@babylonjs/core";

interface Warehouse {
    id: bigint;
    name: string;
    item_id: bigint;
    user_id: bigint;
    thumbnail: string;
    memo: string | null;
    total_size: number;
    filename: string;
    created_at: string | null;
    updated_at: string | null;
}

interface S3ViewerProps {
    warehouse: Warehouse;
    isEditMode?: boolean;
    onCaptureScreenshot?: (screenshot: File) => void;
}

const S3Viewer: React.FC<S3ViewerProps> = ({
    warehouse,
    isEditMode = false,
    onCaptureScreenshot,
}) => {
    const sceneRef = useRef<Scene | null>(null);

    const handleCaptureScreenshot = () => {
        if (!sceneRef.current || !onCaptureScreenshot) return;

        const engine = sceneRef.current.getEngine() as Engine;
        const canvas = engine.getRenderingCanvas();

        if (canvas) {
            // オフスクリーンキャンバスを作成
            const offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = 1024;
            offscreenCanvas.height = 1024;
            const ctx = offscreenCanvas.getContext("2d");

            if (ctx) {
                // 現在のシーンを一度レンダリング
                sceneRef.current.render();

                // 現在のキャンバスの内容をオフスクリーンキャンバスにコピー
                ctx.drawImage(
                    canvas,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                    0,
                    0,
                    1024,
                    1024
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
        <div className="flex-1 overflow-hidden relative">
            {isEditMode && onCaptureScreenshot && (
                <div className="absolute top-2 left-2 z-10">
                    <button
                        onClick={handleCaptureScreenshot}
                        className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                    >
                        現在の表示をサムネイルとして設定
                    </button>
                </div>
            )}
            <SceneComponent
                antialias
                onSceneReady={(scene) => {
                    sceneRef.current = scene;
                    setupWarehouseScene(
                        scene,
                        `${import.meta.env.VITE_S3_URL}/warehouse/${
                            warehouse.user_id
                        }/${warehouse.id}/${warehouse.filename}`
                    );
                }}
                id={`canvas-${warehouse.id}`}
                height="80%"
                className="w-full h-full"
            />
        </div>
    );
};

export default S3Viewer;

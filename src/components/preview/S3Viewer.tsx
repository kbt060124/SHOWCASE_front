import React, { useRef, useState, useEffect } from "react";
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

    const handleCaptureScreenshot = () => {
        if (!sceneRef.current || !onCaptureScreenshot) return;

        const engine = sceneRef.current.getEngine() as Engine;
        const canvas = engine.getRenderingCanvas();

        if (canvas) {
            // オフスクリーンキャンバスを作成
            const offscreenCanvas = document.createElement("canvas");
            const targetSize = 1024;

            // 元のキャンバスのアスペクト比を計算
            const aspectRatio = canvas.width / canvas.height;

            // アスペクト比に基づいてサイズを設定
            if (aspectRatio > 1) {
                // 横長の場合
                offscreenCanvas.width = targetSize;
                offscreenCanvas.height = Math.round(targetSize / aspectRatio);
            } else {
                // 縦長の場合
                offscreenCanvas.height = targetSize;
                offscreenCanvas.width = Math.round(targetSize * aspectRatio);
            }

            const ctx = offscreenCanvas.getContext("2d");

            if (ctx) {
                // 現在のシーンを一度レンダリング
                sceneRef.current.render();

                // アスペクト比を維持しながらリサイズ
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
                height={`${canvasHeight}px`}
                className="w-full h-full"
            />
            {isEditMode && onCaptureScreenshot && (
                <div className="px-4 pt-2">
                    <button
                        onClick={handleCaptureScreenshot}
                        className="text-blue-500 hover:text-blue-600 text-sm mr-4"
                    >
                        Set current view as thumbnail
                    </button>
                </div>
            )}
        </>
    );
};

export default S3Viewer;

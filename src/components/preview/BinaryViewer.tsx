import React, { useEffect, useState } from "react";
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
    const sceneRef = React.useRef<Scene | null>(null);

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

    const captureScreenshot = () => {
        if (!sceneRef.current) {
            console.error("Scene is not ready");
            return;
        }

        const engine = sceneRef.current.getEngine() as Engine;
        const canvas = engine.getRenderingCanvas();

        if (canvas) {
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;

            canvas.width = 1024;
            canvas.height = 1024;

            sceneRef.current.render();

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File([blob], "thumbnail.png", {
                            type: "image/png",
                        });
                        onCaptureScreenshot(file);
                    }

                    canvas.width = originalWidth;
                    canvas.height = originalHeight;
                    sceneRef.current?.render();
                },
                "image/png",
                0.95
            );
        }
    };

    return (
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] overflow-hidden relative">
            {modelData && (
                <>
                    <div className="absolute top-2 left-2 z-10">
                        <button
                            onClick={captureScreenshot}
                            className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                        >
                            現在の表示をサムネイルとして設定
                        </button>
                    </div>
                    <div
                        className="w-full h-full pt-12"
                        style={{ minHeight: "500px" }}
                    >
                        <SceneComponent
                            antialias
                            onSceneReady={(scene) => {
                                console.log("Scene ready:", scene);
                                sceneRef.current = scene;
                                setupUploadScene(scene, modelData);
                            }}
                            id="upload-preview"
                            className="w-full h-full"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default BinaryViewer;

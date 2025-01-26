import React, { useEffect, useState } from "react";
import SceneComponent from "../../SceneComponent";
import {
    SceneLoader,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Scene,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface PreviewProps {
    file: File;
    onCaptureScreenshot: (screenshot: File) => void;
}

const Preview: React.FC<PreviewProps> = ({ file, onCaptureScreenshot }) => {
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
    }, [file]);

    const captureScreenshot = () => {
        if (!sceneRef.current) {
            console.error("Scene is not ready");
            return;
        }

        const engine = sceneRef.current.getEngine();
        const canvas = engine.getRenderingCanvas();

        if (canvas) {
            // 現在のサイズを保存
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;

            // キャプチャ用にサイズを設定
            canvas.width = 1024;
            canvas.height = 1024;

            // 強制的に再レンダリング
            sceneRef.current.render();

            // キャプチャを実行
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File([blob], "thumbnail.png", {
                            type: "image/png",
                        });
                        onCaptureScreenshot(file);
                    }

                    // 元のサイズに戻す
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
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] overflow-hidden">
            {modelData && (
                <>
                    <div className="mb-2">
                        <button
                            onClick={captureScreenshot}
                            className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                        >
                            現在の表示をサムネイルとして設定
                        </button>
                    </div>
                    <div className="w-full h-[500px]">
                        <SceneComponent
                            antialias
                            onSceneReady={(scene) => {
                                console.log("Scene ready:", scene);
                                sceneRef.current = scene;

                                const camera = new ArcRotateCamera(
                                    "camera",
                                    -Math.PI / 2,
                                    Math.PI / 2.5,
                                    10,
                                    Vector3.Zero(),
                                    scene
                                );
                                camera.attachControl(
                                    scene.getEngine().getRenderingCanvas(),
                                    true
                                );

                                new HemisphericLight(
                                    "light",
                                    new Vector3(0, 1, 0),
                                    scene
                                );

                                const blob = new Blob([modelData], {
                                    type: "model/gltf-binary",
                                });
                                const url = URL.createObjectURL(blob);

                                SceneLoader.LoadAssetContainerAsync(
                                    "",
                                    url,
                                    scene,
                                    null,
                                    ".glb"
                                )
                                    .then((container) => {
                                        container.addAllToScene();
                                        URL.revokeObjectURL(url);

                                        const rootMesh = container.meshes[0];
                                        if (rootMesh) {
                                            const boundingInfo =
                                                rootMesh.getHierarchyBoundingVectors(
                                                    true
                                                );
                                            const modelSize =
                                                boundingInfo.max.subtract(
                                                    boundingInfo.min
                                                );
                                            const modelCenter =
                                                boundingInfo.min.add(
                                                    modelSize.scale(0.5)
                                                );

                                            rootMesh.position =
                                                Vector3.Zero().subtract(
                                                    modelCenter
                                                );

                                            const radius =
                                                modelSize.length() * 1.5;
                                            camera.setPosition(
                                                new Vector3(
                                                    0,
                                                    modelSize.y / 2,
                                                    -radius
                                                )
                                            );
                                            camera.setTarget(Vector3.Zero());
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(
                                            "GLBファイルのロードに失敗:",
                                            error
                                        );
                                        URL.revokeObjectURL(url);
                                    });
                            }}
                            id="upload-preview"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Preview;

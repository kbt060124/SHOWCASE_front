import React, { useEffect, useState } from "react";
import SceneComponent from "../../SceneComponent";
import {
    SceneLoader,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface PreviewProps {
    file: File;
}

const Preview: React.FC<PreviewProps> = ({ file }) => {
    const [modelData, setModelData] = useState<ArrayBuffer | null>(null);

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

    return (
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] overflow-hidden">
            {modelData && (
                <SceneComponent
                    antialias
                    onSceneReady={(scene) => {
                        // カメラとライトを追加
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

                        // GLBファイルをロード
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
                                    // モデルのバウンディングボックスを計算
                                    const boundingInfo =
                                        rootMesh.getHierarchyBoundingVectors(
                                            true
                                        );
                                    const modelSize = boundingInfo.max.subtract(
                                        boundingInfo.min
                                    );
                                    const modelCenter = boundingInfo.min.add(
                                        modelSize.scale(0.5)
                                    );

                                    // モデルを中心に配置
                                    rootMesh.position =
                                        Vector3.Zero().subtract(modelCenter);

                                    // カメラの位置を調整
                                    const radius = modelSize.length() * 1.5;
                                    camera.setPosition(
                                        new Vector3(0, modelSize.y / 2, -radius)
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
                    className="w-full h-full"
                />
            )}
        </div>
    );
};

export default Preview;

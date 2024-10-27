import {
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    SceneLoader,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export const setupWarehouseScene = (scene: Scene, modelPath: string) => {
    // カメラを追加
    const camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        scene
    );
    camera.minZ = 0.1;
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    // ライトを追加
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMeshAsync("", "", modelPath, scene)
        .then((result) => {
            console.log("モデルが読み込まれました");
            const rootMesh = result.meshes[0];

            // モデルの位置を調整
            rootMesh.position = Vector3.Zero();

            // モデルのバウンディングボックスを計算
            const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
            const modelSize = boundingInfo.max.subtract(boundingInfo.min);
            const modelCenter = boundingInfo.min.add(modelSize.scale(0.5));

            // モデルを中心に配置
            rootMesh.position = Vector3.Zero().subtract(modelCenter);

            // カメラの位置を調整
            const radius = modelSize.length() * 1.5;
            camera.setPosition(new Vector3(0, 0, -radius));

            // カメラのターゲットをモデルの中心に設定
            camera.setTarget(Vector3.Zero());
        })
        .catch(console.error);
};

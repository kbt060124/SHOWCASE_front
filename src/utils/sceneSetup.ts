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
        Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        scene
    );
    camera.minZ = 0.1;

    // ズーム動作の調整
    camera.wheelPrecision = 100; // 値を大きくするとズームの速度が遅くなります（デフォルトは3）
    camera.lowerRadiusLimit = 0.5; // ズームインの制限
    camera.upperRadiusLimit = 2; // ズームアウトの制限
    camera.pinchPrecision = 50; // モバイルデバイスのピンチズームの感度

    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    // ライトを追加
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMeshAsync("", "", modelPath, scene)
        .then((result) => {
            console.log("モデルが読み込まれました");
            const rootMesh = result.meshes[0];

            // モデルのバウンディングボックスを計算
            const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
            const modelSize = boundingInfo.max.subtract(boundingInfo.min);

            // モデルのサイズを均一に調整
            const maxAllowedSize = 1;
            const scale =
                maxAllowedSize /
                Math.max(modelSize.x, modelSize.y, modelSize.z);
            rootMesh.scaling = new Vector3(scale, scale, scale);

            // スケーリング後のバウンディングボックスを再計算
            const scaledBoundingInfo =
                rootMesh.getHierarchyBoundingVectors(true);

            // モデルのY軸中心を計算
            const modelCenter = scaledBoundingInfo.min.add(
                scaledBoundingInfo.max
                    .subtract(scaledBoundingInfo.min)
                    .scale(0.5)
            );

            // モデルのY軸中心が床（Y=0）に来るように位置を設定
            rootMesh.position = new Vector3(0, -modelCenter.y, 0);

            // カメラの位置を調整
            const radius = 2; // 固定の距離に設定
            camera.setPosition(new Vector3(0, 0, -radius));

            // カメラのターゲットをモデルの中心に設定
            camera.setTarget(Vector3.Zero());
        })
        .catch(console.error);
};

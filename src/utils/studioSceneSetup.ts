import {
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4,
    PointLight,
    SceneLoader,
    ActionManager,
    Mesh,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { setupModelOutline } from "./modelOutline";

export const studioSceneSetup = (scene: Scene, isItem:boolean, modelPath?: string) => {
    // 部屋のサイズ
    const roomSize = {
        width: 20,
        height: 12,
        depth: 20,
        thickness: 0.3,
    };

    // シーンが初期化されていない場合のみ、部屋とカメラをセットアップ
    if (!scene.cameras.length) {
        // 背景色を設定
        scene.clearColor = new Color4(0.1, 0.1, 0.3, 1);

        // カメラを追加
        const camera = new ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 2.5,
            10,
            Vector3.Zero(),
            scene
        );

        // カメラの基本設定
        camera.minZ = 0.1;
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
        camera.collisionRadius = new Vector3(0.1, 0.1, 0.1);
        camera.checkCollisions = false;

        // カメラの位置を部屋の中に設定
        camera.setPosition(
            new Vector3(0, roomSize.height / 2, -roomSize.depth / 2 + 0.1)
        );
        camera.setTarget(new Vector3(0, roomSize.height / 3, 0));

        // カメラの制限を設定
        camera.upperBetaLimit = Math.PI / 2 + 0.4;
        camera.lowerBetaLimit = Math.PI / 4;
        camera.upperAlphaLimit = null;
        camera.lowerAlphaLimit = null;
        camera.lowerRadiusLimit = 1.5;
        camera.upperRadiusLimit = Math.min(
            roomSize.width / 2 - 0.1,
            roomSize.depth / 2 - 0.1
        );

        // カメラの移動設定
        camera.panningAxis = new Vector3(1, 0, 1);
        camera.panningDistanceLimit = Math.min(
            roomSize.width / 2 - 0.1,
            roomSize.depth / 2 - 0.1
        );
        camera.angularSensibilityX = 500;
        camera.angularSensibilityY = 500;
        camera.panningSensibility = 50;

        setupRoom(scene, roomSize);
    }

    //itemのリストを元にモデルを配置する処理

    // モデルのロード処理
    if (isItem) {
        const camera = scene.cameras[0] as ArcRotateCamera;
        SceneLoader.ImportMeshAsync("", "", modelPath, scene)
            .then((result) => {
                console.log("モデルが読み込まれました");
                const rootMesh = result.meshes[0];

                // モデルのバウンディングボックスを計算
                const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
                const modelSize = boundingInfo.max.subtract(boundingInfo.min);

                // カメラの現在の位置と向きからモデルの配置位置を計算
                const forward = camera
                    .getTarget()
                    .subtract(camera.position)
                    .normalize();
                const distance = 5;
                const targetPosition = camera.position.add(
                    forward.scale(distance)
                );

                // モデルをカメラの前に配置
                rootMesh.position = targetPosition;

                // モデルのサイズを適切に調整
                const scale =
                    1 / Math.max(modelSize.x, modelSize.y, modelSize.z);
                rootMesh.scaling = new Vector3(scale, scale, scale);

                // モデルのすべてのメッシュに対して設定
                result.meshes.forEach((mesh) => {
                    mesh.checkCollisions = false;
                    mesh.isPickable = true;
                    if (mesh instanceof Mesh) {
                        mesh.actionManager = new ActionManager(scene);
                    }
                });

                // アウトライン機能を設定
                setupModelOutline(scene, result.meshes);
            })
            .catch(console.error);
    }else{
        const camera = scene.cameras[0] as ArcRotateCamera;
        SceneLoader.ImportMeshAsync("", "", modelPath, scene)
            .then((result) => {
                console.log("モデルが読み込まれました:"+modelPath);
                const rootMesh = result.meshes[0];

                // モデルのバウンディングボックスを計算
                const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
                const modelSize = boundingInfo.max.subtract(boundingInfo.min);

                // 部屋の高さの半分程度になるようにスケールを計算
                const targetHeight = roomSize.height * 0.5;
                const scale = targetHeight / modelSize.y;
                rootMesh.scaling = new Vector3(scale, scale, scale);

                // スケーリング後のバウンディングボックスを再計算
                const scaledBoundingInfo =
                    rootMesh.getHierarchyBoundingVectors(true);

                // モデルの底面が床（Y=0）に来るように位置を設定
                const bottomY = scaledBoundingInfo.min.y;
                rootMesh.position = new Vector3(0, -bottomY, 0);

                // モデルのすべてのメッシュに対して設定
                result.meshes.forEach((mesh) => {
                    mesh.checkCollisions = false;
                    mesh.isPickable = true;
                    if (mesh instanceof Mesh) {
                        mesh.actionManager = new ActionManager(scene);
                    }
                });

                // アウトライン機能を設定
                setupModelOutline(scene, result.meshes);
            })
            .catch(console.error);
    }
};

// 部屋のセットアップ関数
const setupRoom = (scene: Scene, roomSize: any) => {
    setupLighting(scene, roomSize);
    createCeiling(scene, roomSize);
    createFloor(scene, roomSize);
    createWalls(scene, roomSize);
};

// ライティングのセットアップ
const setupLighting = (scene: Scene, roomSize: any) => {
    const mainLight = new HemisphericLight(
        "mainLight",
        new Vector3(0, 1, 0),
        scene
    );
    mainLight.intensity = 1;
    mainLight.groundColor = new Color3(0.3, 0.3, 0.3);

    const ceilingLight = new HemisphericLight(
        "ceilingLight",
        new Vector3(0, -1, 0),
        scene
    );
    ceilingLight.intensity = 0.1;
    ceilingLight.specular = new Color3(0.05, 0.05, 0.05);
    ceilingLight.groundColor = new Color3(0.05, 0.05, 0.05);

    const cornerOffset = 0.2;
    const cornerPositions = [
        new Vector3(
            roomSize.width / 3,
            roomSize.height - cornerOffset,
            roomSize.depth / 3
        ),
        new Vector3(
            -roomSize.width / 3,
            roomSize.height - cornerOffset,
            roomSize.depth / 3
        ),
        new Vector3(
            roomSize.width / 3,
            roomSize.height - cornerOffset,
            -roomSize.depth / 3
        ),
        new Vector3(
            -roomSize.width / 3,
            roomSize.height - cornerOffset,
            -roomSize.depth / 3
        ),
    ];

    cornerPositions.forEach((position, index) => {
        const light = new PointLight(`cornerLight${index}`, position, scene);
        light.intensity = 0.1;
        light.radius = roomSize.width / 2;
    });
};

// 天井の作成
const createCeiling = (scene: Scene, roomSize: any) => {
    const ceiling = MeshBuilder.CreatePlane(
        "ceiling",
        {
            width: roomSize.width,
            height: roomSize.depth,
        },
        scene
    );
    ceiling.position = new Vector3(0, roomSize.height, 0);
    ceiling.rotation = new Vector3(-Math.PI / 2, 0, 0);
    const ceilingMaterial = new StandardMaterial("ceilingMaterial", scene);
    ceilingMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9);
    ceilingMaterial.specularColor = new Color3(0.02, 0.02, 0.02);
    ceilingMaterial.emissiveColor = new Color3(0.02, 0.02, 0.02);
    ceiling.material = ceilingMaterial;
};

// 床の作成
const createFloor = (scene: Scene, roomSize: any) => {
    const floor = MeshBuilder.CreateBox(
        "floor",
        {
            width: roomSize.width,
            height: roomSize.thickness,
            depth: roomSize.depth,
        },
        scene
    );
    floor.position.y = -roomSize.thickness / 2;
    const floorMaterial = new StandardMaterial("floorMaterial", scene);
    floorMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9);
    floor.material = floorMaterial;
};

// 壁の作成
const createWalls = (scene: Scene, roomSize: any) => {
    const createWall = (
        name: string,
        position: Vector3,
        rotation: Vector3,
        width: number,
        height: number
    ) => {
        const wall = MeshBuilder.CreateBox(
            name,
            {
                width: width,
                height: height,
                depth: roomSize.thickness,
            },
            scene
        );
        wall.position = position;
        wall.rotation = rotation;
        const wallMaterial = new StandardMaterial(`${name}Material`, scene);
        wallMaterial.diffuseColor = new Color3(1, 1, 1);
        wall.material = wallMaterial;
    };

    // 各壁の作成
    createWall(
        "backWall",
        new Vector3(0, roomSize.height / 2, roomSize.depth / 2),
        new Vector3(0, 0, 0),
        roomSize.width,
        roomSize.height
    );

    createWall(
        "leftWall",
        new Vector3(-roomSize.width / 2, roomSize.height / 2, 0),
        new Vector3(0, Math.PI / 2, 0),
        roomSize.depth,
        roomSize.height
    );

    createWall(
        "rightWall",
        new Vector3(roomSize.width / 2, roomSize.height / 2, 0),
        new Vector3(0, -Math.PI / 2, 0),
        roomSize.depth,
        roomSize.height
    );

    createWall(
        "frontWall",
        new Vector3(0, roomSize.height / 2, -roomSize.depth / 2),
        new Vector3(0, 0, 0),
        roomSize.width,
        roomSize.height
    );
};

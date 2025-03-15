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
    Tags,
    Quaternion,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import api from "./axios";

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

// カメラの設定処理
const setupCommonScene = (scene: Scene) => {
    // 部屋のサイズ
    const roomSize = {
        width: 20,
        height: 12,
        depth: 20,
        thickness: 0.3,
    };

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
    camera.setTarget(new Vector3(0, roomSize.height / 2.45, 0));

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

    camera.wheelPrecision = 10; // 値を大きくするとズームの速度が遅くなります（デフォルトは3）
    camera.pinchPrecision = 50; // モバイルデバイスのピンチズームの感度
    camera.panningSensibility = 0; // パン操作を無効にする

    camera.panningSensibility = 0;

    return { roomSize };
};

// キャビネットモデルのロード処理
const loadCabinetModel = (scene: Scene, modelPath: string, roomSize: any) => {
    SceneLoader.ImportMeshAsync("", "", modelPath, scene)
        .then((result) => {
            const rootMesh = result.meshes[0];

            // cabinetタグを追加
            Tags.AddTagsTo(rootMesh, "cabinet");

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
            // setupModelOutline(scene, result.meshes);
        })
        .catch(console.error);
};

// キャビネットと表示部分を取得する処理
const findCabinetAndDisplayPart = (scene: Scene) => {
    // キャビネットのメッシュをタグで探す
    const cabinet = scene.meshes.find((mesh) =>
        Tags.MatchesQuery(mesh, "cabinet")
    );

    if (!cabinet) {
        console.error("ディスプレイキャビネットが見つかりません");
        return null;
    }

    // キャビネットの子メッシュをすべて取得
    const allChildren = cabinet.getChildren(
        (node) => node instanceof Mesh,
        false
    );

    // 低い位置にある子メッシュを探す
    const displayPart = allChildren.reduce((lowest, current) => {
        if (!(current instanceof Mesh)) return lowest;
        if (!lowest) return current;

        const currentTop = current.getBoundingInfo().boundingBox.maximumWorld.y;
        const lowestTop = lowest.getBoundingInfo().boundingBox.maximumWorld.y;

        return currentTop < lowestTop ? current : lowest;
    }, null as Mesh | null);

    if (!displayPart) {
        console.error("キャビネットの表示部分が見つかりません");
        return null;
    }

    return { cabinet: cabinet as Mesh, displayPart };
};

// アイテムモデルのロード処理
const loadItemModel = async (
    scene: Scene,
    item: any,
    displayPart: Mesh,
    setters?: {
        setInitialScale: (scale: number) => void;
        setModelScale: (scale: number) => void;
        setModelRotationX: (rotation: number) => void;
        setModelRotationY: (rotation: number) => void;
        setModelHeight: (height: number) => void;
        setDisplayTop: (top: number) => void;
    }
) => {
    const modelPath = `${import.meta.env.VITE_S3_URL}/warehouse/${
        item.user_id
    }/${item.pivot.item_id}/${item.filename}`;

    try {
        const result = await SceneLoader.ImportMeshAsync(
            "",
            "",
            modelPath,
            scene
        );
        const rootMesh = result.meshes[0];

        // warehouse_itemタグを追加
        Tags.AddTagsTo(rootMesh, "warehouse_item");
        rootMesh.metadata = { itemId: item.id };

        // 保存された値を設定
        rootMesh.position = new Vector3(
            item.pivot.position_x,
            item.pivot.position_y,
            item.pivot.position_z
        );

        // バウンディングボックスから基準スケールを計算
        const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
        const modelSize = boundingInfo.max.subtract(boundingInfo.min);
        const maxSize = Math.max(modelSize.x, modelSize.y, modelSize.z);
        const baseScale = 1 / maxSize;

        rootMesh.scaling = new Vector3(
            item.pivot.scale_x,
            item.pivot.scale_y,
            item.pivot.scale_z
        );

        // スライダーの相対値を計算（保存されたスケール / 基準スケール）
        const relativeScale = item.pivot.scale_x / baseScale;

        // displayTopを計算して設定
        const displayTop =
            displayPart.getBoundingInfo().boundingBox.maximumWorld.y;
        if (setters?.setDisplayTop) {
            setters.setDisplayTop(displayTop);
        }

        // 高さの相対値を計算
        const heightDiff = rootMesh.position.y - displayTop;
        const relativeHeight = heightDiff * 10;

        // 保存された回転を設定
        if (item.pivot.rotation_x !== undefined) {
            const savedRotation = new Quaternion(
                item.pivot.rotation_x,
                item.pivot.rotation_y,
                item.pivot.rotation_z,
                item.pivot.rotation_w
            );
            rootMesh.rotationQuaternion = savedRotation;

            // オイラー角に変換して角度を計算
            const euler = savedRotation.toEulerAngles();

            // X軸の回転角度を計算（-180から180の範囲に正規化）
            let rotationX = (euler.x * 180) / Math.PI;
            if (rotationX > 180) rotationX -= 360;
            if (rotationX < -180) rotationX += 360;

            // Y軸の回転角度を計算（-180から180の範囲に正規化）
            let rotationY = (euler.y * 180) / Math.PI + 180;
            if (rotationY > 180) {
                rotationY -= 360;
            } else if (rotationY < -180) {
                rotationY += 360;
            }

            if (setters) {
                setters.setInitialScale(baseScale);
                setters.setModelScale(relativeScale);
                setters.setModelRotationX(rotationX);
                setters.setModelRotationY(rotationY);
                setters.setModelHeight(relativeHeight);
            }
        }

        // その他の設定
        result.meshes.forEach((mesh) => {
            mesh.checkCollisions = false;
            mesh.isPickable = true;
            if (mesh instanceof Mesh) {
                mesh.actionManager = new ActionManager(scene);
            }
        });
    } catch (error) {
        console.error(error);
    }
};

// 保存した部屋の再現 or 初期表示
export const studioSceneSetup = (
    scene: Scene,
    modelPath: string,
    room_id: string,
    setters?: {
        setInitialScale: (scale: number) => void;
        setModelScale: (scale: number) => void;
        setModelRotationX: (rotation: number) => void;
        setModelRotationY: (rotation: number) => void;
        setModelHeight: (height: number) => void;
        setDisplayTop: (top: number) => void;
    },
    endpoint: "studio" | "mainstage" = "studio" // デフォルトは'studio'
): Promise<void> => {
    const { roomSize } = setupCommonScene(scene);
    setupRoom(scene, roomSize);

    loadCabinetModel(scene, modelPath, roomSize);

    return api
        .get(`/api/room/${endpoint}/${room_id}`)
        .then((response) => {
            const items = [...response.data.room.items];

            if (items.length > 0) {
                const cabinetParts = findCabinetAndDisplayPart(scene);
                if (!cabinetParts) return;

                // 各アイテムに対してモデルをロード
                const loadPromises = items.map((item) =>
                    loadItemModel(
                        scene,
                        item,
                        cabinetParts.displayPart,
                        setters
                    )
                );

                return Promise.all(loadPromises).then(() => {});
            }
        })
        .catch((error) => {
            console.error("部屋の読み込みに失敗しました:", error);
            throw error;
        });
};

// アイテムの入れ替え処理
export const studioItemSetup = (
    scene: Scene,
    modelPath: string,
    itemId: bigint
): Promise<{ scale: number; displayTop: number }> => {
    setupCommonScene(scene);

    const cabinetParts = findCabinetAndDisplayPart(scene);
    if (!cabinetParts) return Promise.resolve({ scale: 1, displayTop: 0 });

    return new Promise<{ scale: number; displayTop: number }>((resolve) => {
        SceneLoader.ImportMeshAsync("", "", modelPath, scene)
            .then((result) => {
                const rootMesh = result.meshes[0];

                // warehouse_itemタグを追加
                Tags.AddTagsTo(rootMesh, "warehouse_item");

                // itemIdをメッシュに割り当てる
                rootMesh.metadata = { itemId };

                // モデルのバウンディングボックスを計算
                const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
                const modelSize = boundingInfo.max.subtract(boundingInfo.min);

                // キャビネットの台座部分のY座標を取得
                const displayPartBoundingInfo =
                    cabinetParts.displayPart.getBoundingInfo();
                const displayTop =
                    displayPartBoundingInfo.boundingBox.maximumWorld.y;

                // キャビネットの台座部分の上に配置
                rootMesh.position = new Vector3(
                    cabinetParts.displayPart.position.x,
                    displayTop,
                    cabinetParts.displayPart.position.z
                );

                // モデルを初期状態でカメラの方向に向ける
                rootMesh.rotationQuaternion = Quaternion.RotationAxis(
                    new Vector3(0, 1, 0),
                    Math.PI
                );

                // モデルのサイズを適切に調整
                const maxAllowedSize = 1;
                const scale =
                    maxAllowedSize /
                    Math.max(modelSize.x, modelSize.y, modelSize.z);
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
                // setupModelOutline(scene, result.meshes);

                resolve({ scale, displayTop });
            })
            .catch((error) => {
                console.error("モデルの読み込みエラー:", error);
                resolve({ scale: 1, displayTop: 0 });
            });
    });
};

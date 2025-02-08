import React, { useState, useCallback, FC } from "react";
import SceneComponent from "@/components/SceneComponent";
import { studioSceneSetup, studioItemSetup } from "@/utils/studioSceneSetup";
import { Scene, Tags, Quaternion, Vector3 } from "@babylonjs/core";
import WarehousePanel from "@/pages/studio/components";
import api from "@/utils/axios";
import { useParams } from "react-router-dom";
import { MENU_BAR_HEIGHT } from "@/components/MenuBar";
import CloseIcon from "@mui/icons-material/Close";

interface SavedMeshData {
    itemId: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    scaling: {
        x: number;
        y: number;
        z: number;
    };
    parentIndex: number;
}

const Studio: FC = () => {
    const { room_id } = useParams<{ room_id: string }>();
    const [sceneRef, setSceneRef] = useState<Scene | null>(null);
    const [isWarehousePanelOpen, setIsWarehousePanelOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialScale, setInitialScale] = useState<number>(1);
    const [displayTop, setDisplayTop] = useState(0);
    const [modelScale, setModelScale] = useState<number>(1);
    const [modelRotationX, setModelRotationX] = useState(0);
    const [modelRotationY, setModelRotationY] = useState(0);
    const [modelHeight, setModelHeight] = useState(0);

    const handleSceneReady = useCallback(
        (scene: Scene) => {
            setSceneRef(scene);
            //部屋の再現or初期作成
            if (room_id) {
                studioSceneSetup(
                    scene,
                    "/models/display_cabinet.glb",
                    room_id,
                    {
                        setInitialScale: (scale: number) =>
                            setInitialScale(scale),
                        setModelScale: (scale: number) => setModelScale(scale),
                        setModelRotationX,
                        setModelRotationY,
                        setModelHeight,
                        setDisplayTop,
                    }
                );
            }
        },
        [room_id]
    );

    const handleModelSelect = (modelPath: string, itemId: bigint) => {
        if (sceneRef && room_id) {
            // 既存のwarehouse_itemタグが付いているメッシュを検索して削除
            const meshesToDispose = sceneRef.meshes.filter(
                (mesh) =>
                    Tags.HasTags(mesh) &&
                    Tags.MatchesQuery(mesh, "warehouse_item")
            );
            meshesToDispose.forEach((mesh) => {
                mesh.dispose();
            });

            // アイテムを追加する処理
            studioItemSetup(sceneRef, modelPath, itemId).then(
                ({ scale, displayTop }) => {
                    setInitialScale(scale);
                    setDisplayTop(displayTop);
                }
            );

            // コントロール値をリセット
            setModelScale(1);
            setModelRotationX(0);
            setModelRotationY(0);
            setModelHeight(0);
        }
    };

    const handleClickOutside = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsWarehousePanelOpen(false);
            setIsEditMode(false);
        }
    };

    const handleSave = async () => {
        if (!sceneRef) return;
        setIsSaving(true);

        try {
            // シーンのキャプチャを取得
            const engine = sceneRef.getEngine();
            const canvas = engine.getRenderingCanvas();

            if (canvas) {
                const originalWidth = canvas.width;
                const originalHeight = canvas.height;

                // キャプチャ用に一時的にキャンバスサイズを変更
                canvas.width = 1024;
                canvas.height = 1024;
                sceneRef.render();

                // キャプチャの取得と保存を待機
                await new Promise<void>((resolve) => {
                    canvas.toBlob(
                        async (blob) => {
                            if (blob) {
                                const file = new File([blob], "thumbnail.png", {
                                    type: "image/png",
                                });

                                // FormDataの作成と送信を修正
                                const formData = new FormData();
                                formData.append(
                                    "thumbnail",
                                    file,
                                    "thumbnail.png"
                                ); // ファイル名を明示的に指定

                                // FormDataの内容を確認
                                console.log("FormDataの内容:");
                                for (const pair of formData.entries()) {
                                    console.log(pair[0], pair[1]);
                                }

                                await api.post(
                                    `/api/room/upload/thumbnail/${room_id}`,
                                    formData,
                                    {
                                        headers: {
                                            "Content-Type":
                                                "multipart/form-data",
                                        },
                                    }
                                );
                            }

                            // キャンバスサイズを元に戻す
                            canvas.width = originalWidth;
                            canvas.height = originalHeight;
                            sceneRef.render();
                            resolve();
                        },
                        "image/png",
                        0.95
                    );
                });
            }

            const meshes = sceneRef.meshes;
            const savedData: SavedMeshData[] = [];

            meshes.forEach((mesh) => {
                if (
                    Tags.HasTags(mesh) &&
                    Tags.MatchesQuery(mesh, "warehouse_item")
                ) {
                    // Quaternionを取得
                    const quaternion = mesh.rotationQuaternion;
                    if (!quaternion) {
                        // rotationからQuaternionを生成
                        mesh.rotationQuaternion = mesh.rotation.toQuaternion();
                    }

                    // メタデータからitemIdを取得
                    const itemId = mesh.metadata?.itemId || 0; // メタデータがない場合は0をデフォルトに

                    const meshData: SavedMeshData = {
                        itemId, // メタデータから取得したitemIdを使用
                        position: {
                            x: mesh.position.x,
                            y: mesh.position.y,
                            z: mesh.position.z,
                        },
                        rotation: {
                            x: mesh.rotationQuaternion!.x,
                            y: mesh.rotationQuaternion!.y,
                            z: mesh.rotationQuaternion!.z,
                            w: mesh.rotationQuaternion!.w,
                        },
                        scaling: {
                            x: mesh.scaling.x,
                            y: mesh.scaling.y,
                            z: mesh.scaling.z,
                        },
                        parentIndex: 1, //仮で１を入れておく
                    };
                    savedData.push(meshData);
                }
            });

            // 複数のメッシュデータを送信
            await api.put(`/api/room/update/${room_id}`, savedData);

            alert("保存が完了しました");
        } catch (error) {
            console.error("保存に失敗しました:", error);
            alert("保存に失敗しました");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReturnToWarehouse = () => {
        if (sceneRef) {
            // warehouse_itemタグが付いているメッシュを検索して削除
            const meshesToDispose = sceneRef.meshes.filter(
                (mesh) =>
                    Tags.HasTags(mesh) &&
                    Tags.MatchesQuery(mesh, "warehouse_item")
            );
            meshesToDispose.forEach((mesh) => {
                mesh.dispose();
            });

            // 編集モードを終了
            setIsEditMode(false);
        }
    };

    const handleModelAdjust = (type: string, value: number) => {
        if (!sceneRef) return;

        const warehouseItem = sceneRef.meshes.find(
            (mesh) =>
                Tags.HasTags(mesh) && Tags.MatchesQuery(mesh, "warehouse_item")
        );

        if (!warehouseItem) return;

        switch (type) {
            case "scale":
                const newScale = initialScale * value;
                warehouseItem.scaling.setAll(newScale);
                setModelScale(value);
                break;
            case "rotationX":
                // X軸周りの回転のQuaternionを作成
                const xRotation = Quaternion.RotationAxis(
                    new Vector3(1, 0, 0),
                    value * (Math.PI / 180)
                );
                // Y軸の回転を保持
                const yRotation = Quaternion.RotationAxis(
                    new Vector3(0, 1, 0),
                    -modelRotationY * (Math.PI / 180) + Math.PI // マイナスを追加
                );
                // 回転を合成
                warehouseItem.rotationQuaternion =
                    yRotation.multiply(xRotation);
                setModelRotationX(value);
                break;
            case "rotationY":
                // Y軸周りの回転のQuaternionを作成（値を反転）
                const newYRotation = Quaternion.RotationAxis(
                    new Vector3(0, 1, 0),
                    -value * (Math.PI / 180) + Math.PI // 値を反転して回転方向を逆に
                );

                // X軸の回転を保持
                const currentXRotation = Quaternion.RotationAxis(
                    new Vector3(1, 0, 0),
                    modelRotationX * (Math.PI / 180)
                );

                // 回転を合成
                warehouseItem.rotationQuaternion =
                    newYRotation.multiply(currentXRotation);
                setModelRotationY(value);
                break;
            case "height":
                if (displayTop !== undefined) {
                    // displayTopが設定されていることを確認
                    const heightAdjustment = value * 0.1;
                    warehouseItem.position.y = displayTop + heightAdjustment;
                    setModelHeight(value);
                }
                break;
        }
    };

    const hasDisplayItem = useCallback(() => {
        if (!sceneRef) return false;
        return sceneRef.meshes.some(
            (mesh) =>
                Tags.HasTags(mesh) && Tags.MatchesQuery(mesh, "warehouse_item")
        );
    }, [sceneRef]);

    return (
        <div className="h-screen w-screen flex">
            {isWarehousePanelOpen && (
                <div
                    className="fixed inset-0 z-[1100] bg-white"
                    onClick={handleClickOutside}
                >
                    <WarehousePanel
                        onModelSelect={handleModelSelect}
                        onClose={() => setIsWarehousePanelOpen(false)}
                    />
                </div>
            )}
            <div className="w-full relative">
                {isEditMode && (
                    <div className="absolute top-1 left-0 right-0 flex items-center justify-between px-4 z-[1001]">
                        <button
                            onClick={() => setIsEditMode(false)}
                            className="p-1 hover:opacity-80 transition-opacity"
                            aria-label="編集モードを終了"
                        >
                            <CloseIcon />
                        </button>
                        <h1 className="text-lg font-bold">STUDIO</h1>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="text-[#11529A] hover:opacity-80 text-sm disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
                {!isWarehousePanelOpen && !hasDisplayItem() && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <button
                            onClick={() => setIsWarehousePanelOpen(true)}
                            className="transition-colors pointer-events-auto"
                            aria-label="倉庫を開く"
                        >
                            <img
                                src="/images/add_KCGradation.png"
                                alt=""
                                className="w-12 h-12"
                            />
                        </button>
                    </div>
                )}
                <div
                    style={{ bottom: `${MENU_BAR_HEIGHT + 16}px` }}
                    className="absolute right-4 z-[1001]"
                >
                    {hasDisplayItem() && (
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="p-2 transition-colors"
                            aria-label="編集モード"
                        >
                            <img
                                src="/icons/edit_black.png"
                                alt="Edit"
                                className="w-6 h-6"
                            />
                        </button>
                    )}
                </div>
                {isEditMode && (
                    <div
                        className="fixed inset-0 z-[1001]"
                        onClick={handleClickOutside}
                    >
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg z-[1002]">
                            <div className="max-w-7xl mx-auto px-4 py-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <label className="text-sm font-medium">
                                                Scale
                                            </label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="2"
                                                step="0.1"
                                                value={modelScale}
                                                onChange={(e) =>
                                                    handleModelAdjust(
                                                        "scale",
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-full sm:w-24"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <label className="text-sm font-medium">
                                                Vertical Rotation
                                            </label>
                                            <input
                                                type="range"
                                                min="-180"
                                                max="180"
                                                step="1"
                                                value={modelRotationY}
                                                onChange={(e) =>
                                                    handleModelAdjust(
                                                        "rotationY",
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-full sm:w-24"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <label className="text-sm font-medium">
                                                Horizontal Rotation
                                            </label>
                                            <input
                                                type="range"
                                                min="-180"
                                                max="180"
                                                step="1"
                                                value={modelRotationX}
                                                onChange={(e) =>
                                                    handleModelAdjust(
                                                        "rotationX",
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-full sm:w-24"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <label className="text-sm font-medium">
                                                Height
                                            </label>
                                            <input
                                                type="range"
                                                min="-10"
                                                max="10"
                                                step="0.1"
                                                value={modelHeight}
                                                onChange={(e) =>
                                                    handleModelAdjust(
                                                        "height",
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-full sm:w-24"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleReturnToWarehouse}
                                        className="w-full sm:w-auto px-4 py-2 transition-colors"
                                    >
                                        Return Item to Warehouse
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <SceneComponent
                    antialias
                    onSceneReady={handleSceneReady}
                    id="studio-canvas"
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};

export default Studio;

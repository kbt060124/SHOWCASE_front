import React, { useState, useCallback, FC } from "react";
import SceneComponent from "../../components/SceneComponent";
import {
    studioSceneSetup,
    studioItemSetup,
} from "../../utils/studioSceneSetup";
import { Scene, Tags, Quaternion, Vector3 } from "@babylonjs/core";
import WarehousePanel from "./WarehousePanel";
import { SavedMeshData } from "./room";
import api from "../../axios";
import { useParams } from "react-router-dom";

const Studio: FC = () => {
    const { room_id } = useParams<{ room_id: string }>();
    const [sceneRef, setSceneRef] = useState<Scene | null>(null);
    const [isWarehousePanelOpen, setIsWarehousePanelOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialScale, setInitialScale] = useState(1);
    const [displayTop, setDisplayTop] = useState(0);
    const [modelScale, setModelScale] = useState(1);
    const [modelRotationX, setModelRotationX] = useState(0);
    const [modelRotationY, setModelRotationY] = useState(0);
    const [modelHeight, setModelHeight] = useState(0);

    const handleSceneReady = useCallback(
        (scene: Scene) => {
            setSceneRef(scene);
            //部屋の再現or初期作成
            if (room_id) {
                studioSceneSetup(scene, "/models/display_cabinet.glb", room_id);
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
                // 初期スケールを基準として相対的に調整
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
                // Y軸周りの回転のQuaternionを作成
                const newYRotation = Quaternion.RotationAxis(
                    new Vector3(0, 1, 0),
                    -value * (Math.PI / 180) + Math.PI // マイナスを追加
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
                const heightAdjustment = value * 0.1;
                warehouseItem.position.y = displayTop + heightAdjustment;
                setModelHeight(value);
                break;
        }
    };

    return (
        <div className="h-screen w-screen flex">
            {isWarehousePanelOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={handleClickOutside}
                >
                    <div className="absolute left-0 top-0 w-1/3 h-full bg-white border-r border-gray-200 overflow-y-auto">
                        <WarehousePanel
                            onModelSelect={handleModelSelect}
                            onClose={() => setIsWarehousePanelOpen(false)}
                        />
                    </div>
                </div>
            )}
            <div className="w-full relative">
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors disabled:bg-gray-400"
                    >
                        {isSaving ? "保存中..." : "保存"}
                    </button>
                </div>
                {!isWarehousePanelOpen && (
                    <div className="absolute bottom-4 left-4 z-10">
                        <button
                            onClick={() => setIsWarehousePanelOpen(true)}
                            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white/90 transition-colors"
                            aria-label="倉庫を開く"
                        >
                            <img
                                src="/images/warehouse-icon.png"
                                alt=""
                                className="w-6 h-6"
                            />
                        </button>
                    </div>
                )}
                <div className="absolute bottom-4 right-4 z-10">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white/90 transition-colors"
                        aria-label="編集モード"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                </div>
                {isEditMode && (
                    <div
                        className="fixed inset-0 z-10"
                        onClick={handleClickOutside}
                    >
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg z-20">
                            <div className="max-w-7xl mx-auto px-4 py-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <label className="text-sm font-medium">
                                                サイズ
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
                                                横の向き
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
                                                縦の向き
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
                                                高さ
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
                                        className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Warehouseに戻す
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

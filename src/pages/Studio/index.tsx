import React, { useState, useCallback, FC } from "react";
import SceneComponent from "../../components/SceneComponent";
import { studioSceneSetup } from "../../utils/studioSceneSetup";
import { Scene, Tags } from "@babylonjs/core";
import WarehousePanel from "./WarehousePanel";
import { SavedMeshData } from "./room";
import api from "../../axios";
import { useParams } from "react-router-dom";

const Studio: FC = () => {
    const { room_id } = useParams<{ room_id: string }>();
    const [sceneRef, setSceneRef] = useState<Scene | null>(null);
    const [isWarehousePanelOpen, setIsWarehousePanelOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSceneReady = useCallback((scene: Scene) => {
        setSceneRef(scene);
        studioSceneSetup(scene, false, "/models/display_cabinet.glb");
    }, []);

    const handleModelSelect = (modelPath: string) => {
        if (sceneRef) {
            // 既存のwarehouse_itemタグが付いているメッシュを検索して削除
            const meshesToDispose = sceneRef.meshes.filter(
                (mesh) =>
                    Tags.HasTags(mesh) &&
                    Tags.MatchesQuery(mesh, "warehouse_item")
            );
            meshesToDispose.forEach((mesh) => {
                mesh.dispose();
            });

            // 新しいモデルを表示
            studioSceneSetup(sceneRef, true, modelPath);
        }
    };

    const handleClickOutside = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsWarehousePanelOpen(false);
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

                    const meshData: SavedMeshData = {
                        itemId: 42, //各アイテムのidに変更
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

            // デバッグ用のログ出力
            console.log("保存するデータ:", savedData);

            // 単一のメッシュデータを送信
            for (const meshData of savedData) {
                await api.put(`/api/room/update/${room_id}`, meshData);
            }

            alert("保存が完了しました");
        } catch (error) {
            console.error("保存に失敗しました:", error);
            alert("保存に失敗しました");
        } finally {
            setIsSaving(false);
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

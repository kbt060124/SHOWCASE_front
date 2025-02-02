import {
    Scene,
    AbstractMesh,
    Color3,
    ActionManager,
    ExecuteCodeAction,
    PointerInfo,
    PointerEventTypes,
    Mesh,
    HighlightLayer,
} from "@babylonjs/core";

// 選択状態の型定義
interface ModelSelection {
    mesh: Mesh;
    rootMesh: AbstractMesh;
}

// グローバルな状態管理
let globalHighlightLayer: HighlightLayer | null = null;
let currentSelection: ModelSelection | null = null;
let isHighlightLayerActive = false;

// 選択解除の関数
const clearSelection = () => {
    if (globalHighlightLayer && currentSelection) {
        globalHighlightLayer.removeAllMeshes();
        currentSelection = null;
    }
};

export const setupModelOutline = (scene: Scene, meshes: AbstractMesh[]) => {
    // 既存のハイライトレイヤーをクリーンアップ
    if (globalHighlightLayer) {
        globalHighlightLayer.dispose();
    }

    // 新しいハイライトレイヤーを作成
    globalHighlightLayer = new HighlightLayer("highlightLayer", scene);
    globalHighlightLayer.innerGlow = false;
    globalHighlightLayer.outerGlow = true;
    isHighlightLayerActive = true;

    const rootMesh = meshes[0];

    // メッシュのクリックイベント設定
    meshes.forEach((mesh) => {
        if (!(mesh instanceof Mesh)) return;

        if (!mesh.actionManager) {
            mesh.actionManager = new ActionManager(scene);
        }

        // 既存のアクションをクリア
        mesh.actionManager.actions = [];

        mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                if (!globalHighlightLayer || !isHighlightLayerActive) return;

                // 同じメッシュをクリックした場合は選択解除
                if (currentSelection?.mesh === mesh) {
                    clearSelection();
                    return;
                }

                // 前回選択されていたメッシュのハイライトを削除
                globalHighlightLayer.removeAllMeshes();

                // 新しいメッシュを選択してハイライト
                currentSelection = {
                    mesh: mesh as Mesh,
                    rootMesh: rootMesh,
                };
                globalHighlightLayer.addMesh(
                    mesh as Mesh,
                    new Color3(0, 1.0, 0)
                );
            })
        );
    });

    // 背景クリック時の選択解除
    scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
            const mesh = pointerInfo.pickInfo?.pickedMesh;
            if (
                !mesh ||
                mesh.name.includes("Wall") ||
                mesh.name.includes("floor") ||
                mesh.name.includes("Floor") ||
                mesh.name.includes("ceiling")
            ) {
                clearSelection();
            }
        }
    });
};

// クリーンアップ関数
export const cleanupModelOutline = () => {
    if (globalHighlightLayer) {
        globalHighlightLayer.dispose();
        globalHighlightLayer = null;
    }
    currentSelection = null;
    isHighlightLayerActive = false;
};

import React from "react";
import SceneComponent from "../SceneComponent";
import { setupWarehouseScene } from "../../utils/sceneSetup";

interface ModelViewerProps {
    itemId: bigint;
    warehouseId: bigint;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ itemId, warehouseId }) => (
    <div className="flex-1 min-h-[250px] sm:min-h-[300px] overflow-hidden">
        <SceneComponent
            antialias
            onSceneReady={(scene) =>
                setupWarehouseScene(
                    scene,
                    `https://test-fbx-upload.s3.ap-southeast-2.amazonaws.com/${itemId}.glb`
                )
            }
            id={`canvas-${warehouseId}`}
            className="w-full h-full"
        />
    </div>
);

export default ModelViewer;

import React from "react";
import SceneComponent from "../SceneComponent";
import { setupWarehouseScene } from "../../utils/sceneSetup";
import { type Warehouse } from "./types";

const ModelViewer: React.FC<{ warehouse: Warehouse }> = ({ warehouse }) => (
    <div className="flex-1 min-h-[250px] sm:min-h-[300px] overflow-hidden">
        <SceneComponent
            antialias
            onSceneReady={(scene) =>
                setupWarehouseScene(
                    scene,
                    `${import.meta.env.VITE_S3_URL}/warehouse/${
                        warehouse.user_id
                    }/${warehouse.id}/${warehouse.filename}`
                )
            }
            id={`canvas-${warehouse.id}`}
            className="w-full h-full"
        />
    </div>
);

export default ModelViewer;

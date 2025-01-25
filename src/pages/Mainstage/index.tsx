import { useCallback, FC } from "react";
import SceneComponent from "../../components/SceneComponent";
import { studioSceneSetup } from "../../utils/studioSceneSetup";
import { Scene } from "@babylonjs/core";
import { useParams } from "react-router-dom";

const Studio: FC = () => {
    const { room_id } = useParams<{ room_id: string }>();

    const handleSceneReady = useCallback(
        (scene: Scene) => {
            if (room_id) {
                studioSceneSetup(scene, "/models/display_cabinet.glb", room_id);
            }
        },
        [room_id]
    );

    return (
        <div className="h-screen w-screen flex">
            <div className="w-full relative">
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

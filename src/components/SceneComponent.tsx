import React, { useEffect, useRef } from "react";
import {
    Engine,
    Scene,
    EngineOptions,
    SceneOptions,
    Color4,
} from "@babylonjs/core";

interface SceneComponentProps {
    antialias?: boolean;
    engineOptions?: EngineOptions;
    adaptToDeviceRatio?: boolean;
    sceneOptions?: SceneOptions;
    onRender?: (scene: Scene) => void;
    onSceneReady: (scene: Scene) => void;
    id: string;
    className?: string;
    height?: string | number;
}

const SceneComponent: React.FC<SceneComponentProps> = ({
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
    className,
    height,
    ...rest
}) => {
    const reactCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const { current: canvas } = reactCanvas;

        if (!canvas) return;

        const engine = new Engine(
            canvas,
            antialias,
            engineOptions,
            adaptToDeviceRatio
        );
        const scene = new Scene(engine, sceneOptions);
        // 背景色をより薄い灰色に設定
        scene.clearColor = new Color4(0.9, 0.9, 0.9, 1); // より薄い灰色の背景

        // カメラの初期設定を反転
        scene.useRightHandedSystem = true;

        if (scene.isReady()) {
            onSceneReady(scene);
        } else {
            scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
        }

        engine.runRenderLoop(() => {
            if (typeof onRender === "function") onRender(scene);
            scene.render();
        });

        const resize = () => {
            scene.getEngine().resize();
        };

        if (window) {
            window.addEventListener("resize", resize);
        }

        return () => {
            scene.getEngine().dispose();

            if (window) {
                window.removeEventListener("resize", resize);
            }
        };
    }, [
        antialias,
        engineOptions,
        adaptToDeviceRatio,
        sceneOptions,
        onRender,
        onSceneReady,
    ]);

    return (
        <canvas
            ref={reactCanvas}
            className={className}
            style={{ height: height }}
            {...rest}
        />
    );
};

export default SceneComponent;

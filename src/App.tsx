import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';


const App: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const engine = new BABYLON.Engine(canvas, true);
			const scene = new BABYLON.Scene(engine);

			// カメラを追加
			const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
			camera.minZ = 0.1;
			camera.attachControl(canvas, true);

			// ライトを追加
			new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

			// モデルのパスを直接指定
			const modelPath = '/models/02.glb';

			BABYLON.SceneLoader.ImportMeshAsync('', '', modelPath, scene)
				.then((result) => {
					console.log('モデルが読み込まれました');
					const rootMesh = result.meshes[0];
					
					// モデルの位置を調整
					rootMesh.position = BABYLON.Vector3.Zero();
					
					// モデルのバウンディングボックスを計算
					const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
					const modelSize = boundingInfo.max.subtract(boundingInfo.min);
					const modelCenter = boundingInfo.min.add(modelSize.scale(0.5));

					// モデルを中心に配置
					rootMesh.position = BABYLON.Vector3.Zero().subtract(modelCenter);

					// カメラの位置を調整
					const radius = modelSize.length() * 1.5;
					camera.setPosition(new BABYLON.Vector3(0, 0, -radius));

					// カメラのターゲットをモデルの中心に設定
					camera.setTarget(BABYLON.Vector3.Zero());
				})
				.catch(console.error);

			engine.runRenderLoop(() => {
				scene.render();
			});

			return () => {
				engine.dispose();
			};
		}
	}, []);

	return (
		<canvas 
			ref={canvasRef} 
			id="renderCanvas" 
			style={{ width: '100%', height: '100vh' }} 
		/>
	);
};

export default App;

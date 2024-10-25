'use client';

import React from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, Color3 } from '@babylonjs/core';

const HomePage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
        <Scene>
          <freeCamera name="camera1" position={new Vector3(0, 5, -10)} target={Vector3.Zero()} />
          <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
          <sphere name="sphere1" diameter={2} segments={16} position={new Vector3(0, 1, 0)}>
            <standardMaterial
              name="material1"
              diffuseColor={Color3.Red()}
              specularColor={Color3.Black()}
            />
          </sphere>
          <ground name="ground1" width={6} height={6} subdivisions={2} />
        </Scene>
      </Engine>
    </div>
  );
};

export default HomePage;


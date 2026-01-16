
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { createWoodTexture } from './TextureGenerator';
import { Controls } from '../types';

interface BroomProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isAvailable: boolean; // Only visible in Mission 19
  onPickup: () => void;
}

export const Broom: React.FC<BroomProps> = ({ position, rotation, isAvailable, onPickup }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const broomRef = useRef<THREE.Group>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  // Texture
  const woodTexture = useMemo(() => createWoodTexture(), []);

  useFrame((state) => {
    if (!isAvailable) return;
    if (broomRef.current) {
      const dist = state.camera.position.distanceTo(broomRef.current.position);
      const isClose = dist < 2.5;
      setShowPrompt(isClose);

      if (isClose && interactPressed && !lastPress) {
        onPickup();
      }
      setLastPress(interactPressed);
    }
  });

  if (!isAvailable) return null;

  return (
    <group ref={broomRef} position={position} rotation={rotation}>
      
      {/* MISSION MARKER */}
      <Billboard position={[0, 2.0, 0]}>
          <Text 
            fontSize={0.5} 
            color="yellow" 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            ▼
          </Text>
      </Billboard>

      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 1.5, 0]}>
          <Text 
            fontSize={0.25} 
            color="orange" 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            [E] קח מטאטא
          </Text>
        </Billboard>
      )}

      {/* Handle */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.4]} />
        <meshStandardMaterial map={woodTexture} color="#8B4513" />
      </mesh>

      {/* Brush Head */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#d2691e" />
      </mesh>
      {/* Bristles visual */}
      <mesh position={[0, -0.05, 0]}>
         <boxGeometry args={[0.28, 0.05, 0.04]} />
         <meshStandardMaterial color="#333" />
      </mesh>

    </group>
  );
};

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { createWoodTexture } from './TextureGenerator';
import { Controls } from '../types';

interface WardrobeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const Wardrobe: React.FC<WardrobeProps> = ({ position, rotation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const wardrobeRef = useRef<THREE.Group>(null);
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  // Texture
  const woodTexture = useMemo(() => createWoodTexture(), []);

  useFrame((state, delta) => {
    // 1. Interaction Check
    if (wardrobeRef.current) {
      const dist = state.camera.position.distanceTo(wardrobeRef.current.position);
      const isClose = dist < 3.0;
      setShowPrompt(isClose);

      if (isClose && interactPressed && !lastPress) {
        setIsOpen(!isOpen);
      }
      setLastPress(interactPressed);
    }

    // 2. Animation (Doors opening outwards)
    const targetRotation = isOpen ? Math.PI / 2 : 0;
    
    if (leftDoorRef.current) {
        leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(leftDoorRef.current.rotation.y, -targetRotation, 5 * delta);
    }
    if (rightDoorRef.current) {
        rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(rightDoorRef.current.rotation.y, targetRotation, 5 * delta);
    }
  });

  return (
    <group ref={wardrobeRef} position={position} rotation={rotation}>
      
      {/* UI Prompt - Raised to 2.7 for visibility */}
      {showPrompt && (
        <Billboard position={[0, 2.7, 0]}>
          <Text 
            fontSize={0.3} 
            color="white" 
            outlineWidth={0.03} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {isOpen ? "[E] לסגור" : "[E] לפתוח ארון"}
          </Text>
        </Billboard>
      )}

      {/* --- BODY --- */}
      {/* Dimensions: Width 1.6, Height 2.4, Depth 0.6 */}
      
      {/* Back Panel */}
      <mesh position={[0, 1.2, -0.28]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.4, 0.05]} />
        <meshStandardMaterial map={woodTexture} color="#3e2723" />
      </mesh>
      
      {/* Top Panel */}
      <mesh position={[0, 2.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.05, 0.6]} />
        <meshStandardMaterial map={woodTexture} color="#3e2723" />
      </mesh>

      {/* Bottom Panel */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.05, 0.6]} />
        <meshStandardMaterial map={woodTexture} color="#3e2723" />
      </mesh>

      {/* Left Panel */}
      <mesh position={[-0.78, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 2.4, 0.6]} />
        <meshStandardMaterial map={woodTexture} color="#3e2723" />
      </mesh>

      {/* Right Panel */}
      <mesh position={[0.78, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 2.4, 0.6]} />
        <meshStandardMaterial map={woodTexture} color="#3e2723" />
      </mesh>

      {/* --- INTERIOR --- */}
      {/* Hanging Rail */}
      <mesh position={[0, 2.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Shadowy Interior */}
      <mesh position={[0, 1.2, -0.25]}>
         <planeGeometry args={[1.5, 2.3]} />
         <meshStandardMaterial color="#050505" />
      </mesh>

      {/* --- DOORS --- */}
      
      {/* Left Door - Hinge at Left (-0.8) */}
      <group ref={leftDoorRef} position={[-0.8, 1.2, 0.3]}>
          <mesh position={[0.4, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.78, 2.35, 0.05]} />
              <meshStandardMaterial map={woodTexture} color="#4e342e" />
          </mesh>
          {/* Handle */}
          <mesh position={[0.7, 0, 0.05]}>
              <sphereGeometry args={[0.04]} />
              <meshStandardMaterial color="gold" metalness={0.8} />
          </mesh>
      </group>

      {/* Right Door - Hinge at Right (0.8) */}
      <group ref={rightDoorRef} position={[0.8, 1.2, 0.3]}>
          <mesh position={[-0.4, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.78, 2.35, 0.05]} />
              <meshStandardMaterial map={woodTexture} color="#4e342e" />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.7, 0, 0.05]}>
              <sphereGeometry args={[0.04]} />
              <meshStandardMaterial color="gold" metalness={0.8} />
          </mesh>
      </group>

    </group>
  );
};
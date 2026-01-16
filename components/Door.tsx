
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';

interface DoorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  isLocked?: boolean;
}

export const Door: React.FC<DoorProps> = ({ position, rotation, isOpen, onToggle, isLocked = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null); // The hinge
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const dist = state.camera.position.distanceTo(groupRef.current.position);
      const isClose = dist < 2.5;
      setShowPrompt(isClose);

      if (isClose) {
          if (isLocked) {
              setPromptText("דלת נעולה");
          } else {
              setPromptText(isOpen ? "[E] לסגור" : "[E] לפתוח");
          }

          if (interactPressed && !lastPress) {
            if (!isLocked) {
                onToggle(!isOpen);
            }
          }
      }
      setLastPress(interactPressed);
    }

    // Animation
    if (pivotRef.current) {
        const targetRotation = isOpen ? Math.PI / 2.2 : 0;
        pivotRef.current.rotation.y = THREE.MathUtils.lerp(
            pivotRef.current.rotation.y, 
            targetRotation, 
            5 * delta
        );
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      
      {/* Prompt */}
      {showPrompt && (
        <Billboard position={[0, 2.2, 0]}>
          <Text 
            fontSize={0.2} 
            color={isLocked ? "red" : "white"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* Frame */}
      {/* Top Header */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
         <boxGeometry args={[1.2, 0.1, 0.15]} />
         <meshStandardMaterial color="#3e2723" />
      </mesh>
      {/* Left Post */}
      <mesh position={[-0.55, 1, 0]} castShadow receiveShadow>
         <boxGeometry args={[0.1, 2.2, 0.15]} />
         <meshStandardMaterial color="#3e2723" />
      </mesh>
      {/* Right Post */}
      <mesh position={[0.55, 1, 0]} castShadow receiveShadow>
         <boxGeometry args={[0.1, 2.2, 0.15]} />
         <meshStandardMaterial color="#3e2723" />
      </mesh>

      {/* Door Pivot (Hinge on Left side usually, let's put it on -0.5) */}
      <group ref={pivotRef} position={[-0.5, 0, 0]}>
        {/* The Door Itself (Offset by half width so it rotates from edge) */}
        <mesh position={[0.5, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 2.0, 0.08]} />
            <meshStandardMaterial color="#5d4037" roughness={0.7} />
        </mesh>
        
        {/* Handle */}
        <mesh position={[0.85, 1, 0.06]}>
            <sphereGeometry args={[0.04]} />
            <meshStandardMaterial color="#gold" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.85, 1, -0.06]}>
            <sphereGeometry args={[0.04]} />
            <meshStandardMaterial color="#gold" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

    </group>
  );
};

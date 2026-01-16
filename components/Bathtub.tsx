
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';

interface BathtubProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  onInteract: () => void;
  isClean: boolean;
  missionActive?: boolean; // If true, this is the "ignore" choice (Mission 8.5)
  onIgnoreNoise?: () => void;
}

export const Bathtub: React.FC<BathtubProps> = ({ 
    position, rotation, 
    onInteract, isClean, 
    missionActive, onIgnoreNoise 
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const tubRef = useRef<THREE.Group>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (tubRef.current) {
      const dist = state.camera.position.distanceTo(tubRef.current.position);
      const isClose = dist < 3.0;
      setShowPrompt(isClose);

      if (isClose && interactPressed && !lastPress) {
        if (missionActive && onIgnoreNoise) {
            onIgnoreNoise(); // Complete shower mission
        } else if (!isClean) {
            onInteract();
        }
      }
      setLastPress(interactPressed);
    }
  });

  return (
    <group ref={tubRef} position={position} rotation={rotation}>
      
      {/* MISSION MARKER */}
      {missionActive && (
          <Billboard position={[0, 2.5, 0]}>
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
      )}

      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 1.5, 0]}>
          <Text 
            fontSize={0.25} 
            color={missionActive ? "yellow" : (isClean ? "#88ff88" : "cyan")} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {missionActive ? "[E] להתקלח" : (isClean ? "אתה נקי" : "[E] להיכנס לאמבטיה")}
          </Text>
        </Billboard>
      )}

      {/* --- GEOMETRY --- */}
      {/* Outer Shell */}
      <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.8, 0.6, 0.8]} />
          <meshStandardMaterial color="white" roughness={0.1} />
      </mesh>
      
      {/* Inner Hollow (Simulated by dark top) */}
      <mesh position={[0, 0.55, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[1.6, 0.6]} />
          <meshStandardMaterial 
            color="#111111" 
            roughness={0.2}
          />
      </mesh>

      {/* Faucet */}
      <group position={[0.85, 0.7, 0]}>
          <mesh position={[0, 0.1, 0]}>
             <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
             <meshStandardMaterial color="silver" metalness={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.15, 0]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
             <meshStandardMaterial color="silver" metalness={0.8} />
          </mesh>
      </group>

    </group>
  );
};

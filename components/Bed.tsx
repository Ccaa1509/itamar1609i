
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useKeyboardControls, Billboard } from '@react-three/drei';
import { createBedTexture } from './TextureGenerator';
import * as THREE from 'three';
import { Controls } from '../types';

interface BedProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isResting: boolean;
  onToggleRest: (val: boolean) => void;
  missionActive?: boolean; // Mission 9: Go to sleep
  onSleep?: () => void;
}

export const Bed: React.FC<BedProps> = ({ position, rotation, isResting, onToggleRest, missionActive, onSleep }) => {
  const sheetTexture = useMemo(() => createBedTexture(), []);
  const bedRef = useRef<THREE.Group>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (bedRef.current) {
      const dist = state.camera.position.distanceTo(bedRef.current.position);
      const isClose = dist < 2.5;
      
      // Allow exiting even if "far" (though camera should be close if resting)
      setShowPrompt(isClose || isResting);

      if ((isClose || isResting) && interactPressed && !lastPress) {
        if (missionActive && onSleep) {
            onSleep();
        } else {
            onToggleRest(!isResting);
        }
      }
      setLastPress(interactPressed);
    }
  });

  return (
    <group ref={bedRef} position={position} rotation={rotation}>
      
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
        <Billboard
          position={[0, 2.0, 0]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
         <Text 
           fontSize={0.3} 
           color={missionActive ? "yellow" : "cyan"} 
           anchorX="center" 
           anchorY="middle"
           outlineWidth={0.03} 
           outlineColor="black"
           material-depthTest={false}
           renderOrder={999}
         >
           {missionActive ? "[E] ללכת לישון" : (isResting ? "[E] לקום" : "[E] לנוח")}
         </Text>
        </Billboard>
      )}

      {/* Frame */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.6, 0.4, 2.2]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>

      {/* Mattress/Sheets */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.5, 0.2, 2.1]} />
        <meshStandardMaterial map={sheetTexture} roughness={0.8} />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, 0.6, -0.8]} rotation={[0.2, 0, 0]} castShadow>
         <boxGeometry args={[0.8, 0.15, 0.4]} />
         <meshStandardMaterial color="#eeeeee" />
      </mesh>
      
      {/* Headboard */}
      <mesh position={[0, 0.6, -1.15]} castShadow>
         <boxGeometry args={[1.6, 1.2, 0.1]} />
         <meshStandardMaterial color="#2a1a10" />
      </mesh>
    </group>
  );
};

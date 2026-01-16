import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useKeyboardControls, Billboard } from '@react-three/drei';
import { createFabricTexture } from './TextureGenerator';
import * as THREE from 'three';
import { Controls } from '../types';

interface SofaProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isHiding: boolean;
  onToggleHide: (val: boolean) => void;
}

export const Sofa: React.FC<SofaProps> = ({ position, rotation, isHiding, onToggleHide }) => {
  const fabricTexture = useMemo(() => createFabricTexture(), []);
  const sofaRef = useRef<THREE.Group>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (sofaRef.current) {
      const dist = state.camera.position.distanceTo(sofaRef.current.position);
      // Detection radius for hiding
      const isClose = dist < 2.5; 
      
      setShowPrompt(isClose || isHiding);

      if ((isClose || isHiding) && interactPressed && !lastPress) {
        onToggleHide(!isHiding);
      }
      setLastPress(interactPressed);
    }
  });

  // Dimensions
  const legHeight = 0.5;
  const seatHeight = 0.3;
  const width = 2.8; 
  const depth = 1.0; 
  
  return (
    <group ref={sofaRef} position={position} rotation={rotation}>
      
      {/* Light under the sofa - visible only when hiding or very close, prevents black screen */}
      <pointLight 
        position={[0, 0.2, 0]} 
        intensity={isHiding ? 1.5 : 0} 
        distance={3} 
        color="#ffaa88" 
        decay={2}
      />

      {/* UI Prompt - Always visible on top */}
      {showPrompt && (
        <Billboard
          position={[0, 2.0, 0]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
         <Text 
           fontSize={0.4} 
           color="red" 
           anchorX="center" 
           anchorY="middle"
           outlineWidth={0.04}
           outlineColor="black"
           material-depthTest={false} // CRITICAL: Renders on top of everything
           renderOrder={999}
         >
           {isHiding ? "[E] לצאת" : "[E] להתחבא"}
         </Text>
        </Billboard>
      )}

      {/* --- LEGS --- */}
      {/* Front Left */}
      <mesh position={[-width/2 + 0.15, legHeight/2, depth/2 - 0.15]} castShadow>
        <boxGeometry args={[0.1, legHeight, 0.1]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
      {/* Front Right */}
      <mesh position={[width/2 - 0.15, legHeight/2, depth/2 - 0.15]} castShadow>
        <boxGeometry args={[0.1, legHeight, 0.1]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
      {/* Back Left */}
      <mesh position={[-width/2 + 0.15, legHeight/2, -depth/2 + 0.15]} castShadow>
        <boxGeometry args={[0.1, legHeight, 0.1]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
       {/* Back Right */}
       <mesh position={[width/2 - 0.15, legHeight/2, -depth/2 + 0.15]} castShadow>
        <boxGeometry args={[0.1, legHeight, 0.1]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>

      {/* --- SEAT --- */}
      <mesh position={[0, legHeight + seatHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, seatHeight, depth]} />
        <meshStandardMaterial map={fabricTexture} color="#772222" roughness={0.9} />
      </mesh>

      {/* --- BACKREST --- */}
      <mesh position={[0, legHeight + seatHeight + 0.4, -depth/2 + 0.15]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.8, 0.3]} />
        <meshStandardMaterial map={fabricTexture} color="#772222" roughness={0.9} />
      </mesh>

      {/* --- ARMRESTS --- */}
      {/* Left */}
      <mesh position={[-width/2 + 0.2, legHeight + seatHeight + 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.3, depth]} />
        <meshStandardMaterial map={fabricTexture} color="#772222" roughness={0.9} />
      </mesh>
      {/* Right */}
      <mesh position={[width/2 - 0.2, legHeight + seatHeight + 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.3, depth]} />
        <meshStandardMaterial map={fabricTexture} color="#772222" roughness={0.9} />
      </mesh>

    </group>
  );
};

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';

interface FuseBoxProps {
  position: [number, number, number];
  isPowerOff: boolean;
  onFix: () => void;
}

export const FuseBox: React.FC<FuseBoxProps> = ({ position, isPowerOff, onFix }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      const dist = state.camera.position.distanceTo(ref.current.position);
      const isClose = dist < 2.0;
      setShowPrompt(isClose);

      if (isClose && isPowerOff) {
          if (interactPressed && !lastPress) {
              onFix();
          }
      }
      setLastPress(interactPressed);
    }
  });

  return (
    <group ref={ref} position={position}>
      {showPrompt && isPowerOff && (
        <Billboard position={[0, 0.5, 0]}>
          <Text 
            fontSize={0.2} 
            color="red" 
            outlineWidth={0.02} 
            outlineColor="black" 
            renderOrder={999}
            material-depthTest={false}
          >
            [E] להרים שלטר
          </Text>
        </Billboard>
      )}
      
      {/* Box */}
      <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.4, 0.1]} />
          <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      
      {/* Switch */}
      <mesh position={[0, 0, 0.06]} rotation={[isPowerOff ? 0.5 : -0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          <meshStandardMaterial color={isPowerOff ? "red" : "green"} emissive={isPowerOff ? "red" : "green"} emissiveIntensity={0.5} />
      </mesh>

      {/* Label */}
      <mesh position={[0, 0.15, 0.051]}>
          <planeGeometry args={[0.2, 0.05]} />
          <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
};

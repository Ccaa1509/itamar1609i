
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';

interface RouterProps {
  position: [number, number, number];
  missionActive: boolean;
  isReset: boolean;
  onFix: () => void;
}

export const Router: React.FC<RouterProps> = ({ position, missionActive, isReset, onFix }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      const dist = state.camera.position.distanceTo(ref.current.position);
      const isClose = dist < 2.0;
      setShowPrompt(isClose);

      if (isClose && missionActive && !isReset) {
          if (interactPressed && !lastPress) {
              onFix();
          }
      }
      setLastPress(interactPressed);
    }
  });

  return (
    <group ref={ref} position={position}>
      {showPrompt && missionActive && !isReset && (
        <Billboard position={[0, 0.5, 0]}>
          <Text 
            fontSize={0.15} 
            color="cyan" 
            outlineWidth={0.02} 
            outlineColor="black" 
            renderOrder={999}
            material-depthTest={false}
          >
            [E] אתחל ראוטר
          </Text>
        </Billboard>
      )}
      
      {/* Box */}
      <mesh castShadow>
          <boxGeometry args={[0.2, 0.05, 0.15]} />
          <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Antennas */}
      <mesh position={[-0.08, 0.1, -0.05]}>
          <cylinderGeometry args={[0.005, 0.005, 0.2]} />
          <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.08, 0.1, -0.05]}>
          <cylinderGeometry args={[0.005, 0.005, 0.2]} />
          <meshStandardMaterial color="black" />
      </mesh>

      {/* Blinking Lights */}
      {/* If mission active (broken) = Red blink. If reset = Green steady. Normal = Green blink */}
      <mesh position={[-0.05, 0.03, 0.076]}>
          <sphereGeometry args={[0.005]} />
          <meshStandardMaterial 
            color={missionActive && !isReset ? "red" : "green"} 
            emissive={missionActive && !isReset ? "red" : "green"} 
            emissiveIntensity={2} 
          />
      </mesh>
      <mesh position={[0, 0.03, 0.076]}>
          <sphereGeometry args={[0.005]} />
          <meshStandardMaterial 
            color="green" 
            emissive="green" 
            emissiveIntensity={isReset ? 2 : (missionActive ? 0 : 2)} 
          />
      </mesh>
    </group>
  );
};

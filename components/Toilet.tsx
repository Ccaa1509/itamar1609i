
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { playFlushSound } from './AudioEngine';

interface ToiletProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isClogged?: boolean;
  hasPlunger?: boolean;
  onUnclog?: () => void;
}

export const Toilet: React.FC<ToiletProps> = ({ position, rotation, isClogged, hasPlunger, onUnclog }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const toiletRef = useRef<THREE.Group>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);

  useFrame((state) => {
    if (toiletRef.current) {
      const dist = state.camera.position.distanceTo(toiletRef.current.position);
      const isClose = dist < 2.5;
      setShowPrompt(isClose);

      if (isClose) {
          if (isClogged) {
              if (hasPlunger) {
                  setPromptText("[E] לנקות");
                  if (interactPressed && !lastPress && onUnclog) {
                      onUnclog();
                  }
              } else {
                  setPromptText("השירותים סתומים! צריך פומפה...");
              }
          } else {
              setPromptText("[E] להוריד מים");
              if (interactPressed && !lastPress && !isFlushing) {
                setIsFlushing(true);
                playFlushSound();
                setTimeout(() => setIsFlushing(false), 3000);
              }
          }
      }
      setLastPress(interactPressed);
    }
  });

  return (
    <group ref={toiletRef} position={position} rotation={rotation}>
      
      {/* UI Prompt */}
      {showPrompt && !isFlushing && (
        <Billboard position={[0, 2.0, 0]}>
          <Text 
            fontSize={0.25} 
            color={isClogged ? "red" : "white"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* --- GEOMETRY --- */}
      
      {/* Tank */}
      <mesh position={[0, 0.9, -0.25]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.2]} />
          <meshStandardMaterial color="white" roughness={0.1} />
      </mesh>
      
      {/* Bowl Base (Cylinder) */}
      <mesh position={[0, 0.3, 0.1]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 16]} />
          <meshStandardMaterial color="white" roughness={0.1} />
      </mesh>

      {/* Bowl Rim (Torus) */}
      <mesh position={[0, 0.6, 0.15]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[0.2, 0.05, 16, 32]} />
          <meshStandardMaterial color="white" roughness={0.1} />
      </mesh>

      {/* Water (Brown if clogged) */}
      <mesh position={[0, 0.55, 0.15]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[0.18]} />
          <meshStandardMaterial color={isClogged ? "#5D4037" : "#aaddff"} roughness={0.2} />
      </mesh>

      {/* Lid (Box, slightly open) */}
      <mesh position={[0, 0.8, -0.1]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.45, 0.5, 0.05]} />
          <meshStandardMaterial color="white" roughness={0.1} />
      </mesh>

      {/* Flush Handle */}
      <mesh position={[0.25, 1.0, -0.25]} rotation={[0, 0, isFlushing ? -0.5 : 0]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="silver" metalness={1} />
      </mesh>

    </group>
  );
};

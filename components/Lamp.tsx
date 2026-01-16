
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { hauntState } from './HauntState';

interface LampProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    onToggle?: () => void;
}

export const Lamp: React.FC<LampProps> = ({ position, rotation, onToggle }) => {
  const [isOn, setIsOn] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const lampRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (lampRef.current) {
      const dist = state.camera.position.distanceTo(lampRef.current.position);
      // Slightly larger radius so you can reach it from the bed
      const isClose = dist < 3.0; 
      
      setShowPrompt(isClose);

      if (isClose && interactPressed && !lastPress) {
        const newState = !isOn;
        setIsOn(newState);
        if (newState && onToggle) onToggle();
      }
      setLastPress(interactPressed);

      // Flicker Logic
      if (isOn && lightRef.current) {
          if (hauntState.isGlitching) {
              const flicker = Math.random() > 0.6 ? 0.1 : (Math.random() > 0.3 ? 0 : 1.5);
              lightRef.current.intensity = 1.0 * flicker;
          } else {
              lightRef.current.intensity = 1.0;
          }
      }
    }
  });

  return (
    <group ref={lampRef} position={position} rotation={rotation}>
      
      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 2.0, 0]}>
          <Text 
            fontSize={0.25} 
            color="yellow" 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {isOn ? "[E] לכבות" : "[E] להדליק"}
          </Text>
        </Billboard>
      )}

      {/* --- STAND --- */}
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      
      {/* Pole */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* --- SHADE --- */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
         {/* Top radius smaller than bottom radius for classic shade look */}
         <cylinderGeometry args={[0.2, 0.4, 0.5, 32, 1, true]} />
         <meshStandardMaterial color="#f5f5dc" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      
      {/* Bulb (Visual only) */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial 
            color={isOn ? "#ffffaa" : "#444444"} 
            emissive={isOn ? "#ffffaa" : "#000000"}
            emissiveIntensity={isOn && (!hauntState.isGlitching || Math.random() > 0.5) ? 2 : 0}
        />
      </mesh>

      {/* --- LIGHT SOURCE --- */}
      {isOn && (
        <group>
            {/* The actual light creating shadows */}
            <pointLight 
                ref={lightRef}
                position={[0, 1.4, 0]} 
                intensity={1.0} 
                distance={8} 
                decay={2} 
                color="#ffaa55" 
                castShadow 
                shadow-bias={-0.0001}
            />
            {/* Glow effect helper */}
            <pointLight 
                position={[0, 1.5, 0]} 
                intensity={hauntState.isGlitching ? 0.2 : 0.5} 
                distance={2} 
                color="#ffffaa" 
            />
        </group>
      )}

    </group>
  );
};

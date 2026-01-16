
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { playGuitarStrum } from './AudioEngine';
import { Controls } from '../types';

export const Guitar: React.FC<{ 
    position: [number, number, number], 
    rotation?: [number, number, number],
    isHighlighted?: boolean,
    onPlay?: () => void
}> = ({ position, rotation, isHighlighted, onPlay }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guitarRef = useRef<THREE.Group>(null);
  
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (guitarRef.current) {
      const dist = state.camera.position.distanceTo(guitarRef.current.position);
      const isClose = dist < 2.5;
      setShowPrompt(isClose);

      if (isClose && interactPressed && !lastPress) {
        playGuitarStrum();
        setIsPlaying(true);
        if (onPlay) onPlay();
        // Visual shake effect
        setTimeout(() => setIsPlaying(false), 300);
      }
      setLastPress(interactPressed);

      // Animation when playing
      if (isPlaying) {
          guitarRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 50) * 0.02;
          guitarRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 30) * 0.01;
      } else {
          // Reset
          guitarRef.current.rotation.z = THREE.MathUtils.lerp(guitarRef.current.rotation.z, 0, 0.1);
          guitarRef.current.position.y = THREE.MathUtils.lerp(guitarRef.current.position.y, position[1], 0.1);
      }
    }
  });

  return (
    <group ref={guitarRef} position={position} rotation={rotation}>
      
      {/* MISSION MARKER */}
      {isHighlighted && (
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
        <Billboard position={[0, 1.8, 0]}>
          <Text 
            fontSize={0.25} 
            color="orange" 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            [E] לנגן
          </Text>
        </Billboard>
      )}

      {/* --- STAND --- */}
      <mesh position={[0, 0.4, -0.1]} rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.2, 0.1, 0.1]} rotation={[-0.4, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#111" />
      </mesh>
       <mesh position={[0.2, 0.1, 0.1]} rotation={[-0.4, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#111" />
      </mesh>

      {/* --- GUITAR --- */}
      <group position={[0, 0.5, 0.05]} rotation={[0, 0, 0.15]}> 
          {/* Body - Main part (Bottom) */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
            <meshStandardMaterial color="#8B4513" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.051]}>
             <circleGeometry args={[0.23, 32]} />
             <meshStandardMaterial color="#A0522D" roughness={0.4} />
          </mesh>

           {/* Body - Upper part (Joined) */}
           <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
            <meshStandardMaterial color="#8B4513" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.25, 0.051]}>
             <circleGeometry args={[0.18, 32]} />
             <meshStandardMaterial color="#A0522D" roughness={0.4} />
          </mesh>

          {/* Sound Hole */}
          <mesh position={[0, 0.15, 0.052]}>
              <circleGeometry args={[0.08, 32]} />
              <meshBasicMaterial color="#1a0000" />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.6, 0.02]} castShadow>
             <boxGeometry args={[0.06, 0.6, 0.02]} />
             <meshStandardMaterial color="#3e2723" />
          </mesh>

          {/* Fretboard */}
          <mesh position={[0, 0.6, 0.031]}>
             <planeGeometry args={[0.05, 0.6]} />
             <meshStandardMaterial color="#111" />
          </mesh>

          {/* Headstock */}
          <mesh position={[0, 0.95, 0.01]} castShadow>
             <boxGeometry args={[0.08, 0.15, 0.02]} />
             <meshStandardMaterial color="#8B4513" />
          </mesh>

          {/* Bridge */}
          <mesh position={[0, -0.15, 0.055]}>
              <boxGeometry args={[0.12, 0.03, 0.01]} />
              <meshStandardMaterial color="#221100" />
          </mesh>

          {/* Strings (Visual approximation) */}
          <mesh position={[0, 0.4, 0.04]}>
              <planeGeometry args={[0.04, 0.9]} />
              <meshBasicMaterial color="#silver" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
      </group>

    </group>
  );
};

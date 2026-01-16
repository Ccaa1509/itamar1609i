
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { toggleWaterSound } from './AudioEngine';
import { Controls } from '../types';

// Component for the animated hands washing
const WashingHands: React.FC = () => {
    const leftHand = useRef<THREE.Mesh>(null);
    const rightHand = useRef<THREE.Mesh>(null);
    const bubblesRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime * 10;
        
        if (leftHand.current && rightHand.current) {
            // Rubbing motion - oscillating position and rotation
            leftHand.current.position.x = -0.06 + Math.sin(t) * 0.02;
            leftHand.current.position.z = 0.15 + Math.cos(t) * 0.02;
            leftHand.current.rotation.z = -0.1 + Math.sin(t * 0.5) * 0.1;
            leftHand.current.rotation.x = Math.sin(t * 0.3) * 0.1;

            rightHand.current.position.x = 0.06 - Math.sin(t) * 0.02;
            rightHand.current.position.z = 0.15 - Math.cos(t) * 0.02;
            rightHand.current.rotation.z = 0.1 - Math.sin(t * 0.5) * 0.1;
            rightHand.current.rotation.x = Math.sin(t * 0.3 + 1) * 0.1;
        }

        // Animate soap bubbles
        if (bubblesRef.current) {
             bubblesRef.current.position.y = 0.05 + Math.sin(t * 2) * 0.01;
             bubblesRef.current.rotation.z += 0.02;
        }
    });

    return (
        <group position={[0, 0.55, 0]}>
            {/* Left Hand */}
            <mesh ref={leftHand} position={[-0.06, 0, 0.15]}>
                <boxGeometry args={[0.09, 0.06, 0.18]} />
                <meshStandardMaterial color="#ffdbac" roughness={0.4} />
            </mesh>
            {/* Right Hand */}
            <mesh ref={rightHand} position={[0.06, 0, 0.15]}>
                <boxGeometry args={[0.09, 0.06, 0.18]} />
                <meshStandardMaterial color="#ffdbac" roughness={0.4} />
            </mesh>
            
            {/* Soap Suds / Foam */}
            <group ref={bubblesRef}>
                <mesh position={[0, 0.05, 0.1]} rotation={[-Math.PI/2, 0, 0]}>
                     <circleGeometry args={[0.08, 5]} />
                     <meshBasicMaterial color="white" opacity={0.6} transparent />
                </mesh>
                <mesh position={[0.05, 0.06, 0.12]} rotation={[-Math.PI/2, 0, 0]}>
                     <circleGeometry args={[0.04, 4]} />
                     <meshBasicMaterial color="white" opacity={0.5} transparent />
                </mesh>
            </group>
        </group>
    );
};

export const Sink: React.FC<{ 
    position: [number, number, number], 
    rotation?: [number, number, number],
    missionActive?: boolean,
    onWash?: () => void
}> = ({ position, rotation, missionActive, onWash }) => {
  const [isFlowing, setIsFlowing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlayerClose, setIsPlayerClose] = useState(false);
  const sinkRef = useRef<THREE.Group>(null);
  
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (sinkRef.current) {
      const dist = state.camera.position.distanceTo(sinkRef.current.position);
      const isClose = dist < 2.5;
      const isVeryClose = dist < 1.6; // Threshold for showing hands
      
      setShowPrompt(isClose);
      setIsPlayerClose(isVeryClose);

      if (isClose && interactPressed && !lastPress) {
        setIsFlowing(prev => !prev);
        if (!isFlowing && missionActive && onWash) {
            onWash();
        }
      }
      setLastPress(interactPressed);
    }
  });

  // Handle Audio Side Effects
  useEffect(() => {
    toggleWaterSound(isFlowing);
    return () => {
        // Stop sound if component unmounts
        toggleWaterSound(false);
    };
  }, [isFlowing]);

  return (
    <group ref={sinkRef} position={position} rotation={rotation}>
      
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
        <Billboard position={[0, 2.0, 0]}>
          <Text 
            fontSize={0.25} 
            color={missionActive ? "yellow" : "cyan"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {missionActive ? "[E] לשטוף פנים" : (isFlowing ? "[E] לסגור מים" : "[E] לשטוף ידיים")}
          </Text>
        </Billboard>
      )}

      {/* --- CABINET (Base) - Reverted to Black --- */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* --- COUNTERTOP - Reverted to Black --- */}
      {/* Left side */}
      <mesh position={[-0.5, 0.92, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Right side */}
      <mesh position={[0.5, 0.92, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Back strip */}
      <mesh position={[0, 0.92, -0.35]} receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
       {/* Front strip */}
       <mesh position={[0, 0.92, 0.35]} receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* --- BASIN (The bottom of the sink) --- */}
      <mesh position={[0, 0.75, 0]} receiveShadow>
         <boxGeometry args={[0.5, 0.02, 0.5]} />
         <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </mesh>
       {/* Basin Walls (Visual fake to make it look deep) */}
       <mesh position={[0, 0.83, 0]} receiveShadow>
         <boxGeometry args={[0.48, 0.15, 0.48]} />
         <meshStandardMaterial color="#111" /> {/* Dark inside */}
      </mesh>

      {/* --- FAUCET --- */}
      <group position={[0, 0.95, -0.3]}>
         {/* Vertical Stem */}
         <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.2, 16]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
         </mesh>
         {/* Horizontal Spout */}
         <mesh position={[0, 0.2, 0.1]} rotation={[Math.PI/4, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 16]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
         </mesh>
         
         {/* Handles */}
         <mesh position={[-0.15, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} />
         </mesh>
         <mesh position={[0.15, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} />
         </mesh>
      </group>

      {/* --- WATER STREAM & HANDS --- */}
      {isFlowing && (
          <group>
            {/* The stream */}
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
                <meshBasicMaterial color="#aaddff" transparent opacity={0.6} />
            </mesh>
            {/* Splash at bottom */}
            <mesh position={[0, 0.2, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[0.1, 16]} />
                <meshBasicMaterial color="#aaddff" transparent opacity={0.4} />
            </mesh>
            {/* Dynamic Light from water reflection */}
             <pointLight position={[0, 0.5, 0]} color="cyan" intensity={0.5} distance={1} decay={2} />
             
             {/* HANDS: Render only if player is very close */}
             {isPlayerClose && <WashingHands />}
          </group>
      )}

    </group>
  );
};

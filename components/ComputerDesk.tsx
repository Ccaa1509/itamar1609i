
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { createGoogleScreenTexture, createNevoFaceTexture, createBloodTexture } from './TextureGenerator';
import { playTypingSound, playNevoDemonScream } from './AudioEngine';

interface ComputerDeskProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  missionActive: boolean;
  onComputerEvent: (eventType: 'SEARCH' | 'SCARE_DONE' | 'FINALE') => void;
}

export const ComputerDesk: React.FC<ComputerDeskProps> = ({ 
    position, rotation, missionActive, onComputerEvent
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  
  // Computer State: OFF, SEARCHING (Typing), SCARE (Nevo Face), BLOODY
  const [compState, setCompState] = useState<'OFF' | 'SEARCHING' | 'SCARE' | 'BLOODY'>('OFF');
  
  const ref = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  // Textures
  const googleTex = useMemo(() => createGoogleScreenTexture(), []);
  const nevoTex = useMemo(() => createNevoFaceTexture(), []);
  const bloodTex = useMemo(() => createBloodTexture(), []);

  useEffect(() => {
      // Screen Update Logic
      if (screenRef.current) {
          const mat = screenRef.current.material as THREE.MeshStandardMaterial;
          if (compState === 'OFF') {
              mat.color.set('#000');
              mat.emissive.set('#000');
              mat.emissiveIntensity = 0;
              mat.map = null;
          } else if (compState === 'SEARCHING') {
              mat.color.set('#fff');
              mat.emissive.set('#fff');
              mat.emissiveIntensity = 0.8;
              mat.map = googleTex;
          } else if (compState === 'SCARE') {
              mat.color.set('#fff');
              mat.emissive.set('#fff');
              mat.emissiveIntensity = 2; // Bright flash
              mat.map = nevoTex;
          } else if (compState === 'BLOODY') {
              mat.color.set('#500');
              mat.emissive.set('#300');
              mat.emissiveIntensity = 0.5;
              mat.map = bloodTex;
          }
          mat.needsUpdate = true;
      }
  }, [compState, googleTex, nevoTex, bloodTex]);

  const handleInteraction = () => {
      if (compState === 'OFF') {
          // Start Sequence
          setCompState('SEARCHING');
          
          // Typing Simulation
          let types = 0;
          const typeInterval = setInterval(() => {
              playTypingSound();
              types++;
              if (types > 8) clearInterval(typeInterval);
          }, 200);

          // Delay to SCARE
          setTimeout(() => {
              // SCARE HAPPENS
              setCompState('SCARE');
              playNevoDemonScream();
              
              // NEW FINALE LOGIC
              onComputerEvent('FINALE');

          }, 3000);
      }
  };

  useFrame((state) => {
    if (ref.current) {
      const dist = state.camera.position.distanceTo(ref.current.position);
      const isClose = dist < 2.5;
      
      // Only show interaction if active mission and computer is OFF
      const canInteract = isClose && missionActive && compState === 'OFF';
      setShowPrompt(canInteract);

      if (canInteract) {
          setPromptText("[E] לשבת לשחק");
          if (interactPressed && !lastPress) {
              handleInteraction();
          }
      }
      setLastPress(interactPressed);
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
        
        {/* Prompt */}
        {showPrompt && (
            <Billboard position={[0, 2.0, 0]}>
                <Text fontSize={0.25} color="cyan" outlineWidth={0.02} outlineColor="black" renderOrder={999} material-depthTest={false}>
                    {promptText}
                </Text>
            </Billboard>
        )}

        {/* MISSION MARKER */}
        {missionActive && compState === 'OFF' && (
          <Billboard position={[0, 2.5, 0]}>
              <Text fontSize={0.5} color="yellow" outlineWidth={0.02} outlineColor="black" material-depthTest={false} renderOrder={999}>
                ▼
              </Text>
          </Billboard>
        )}

        {/* --- DESK --- */}
        <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.05, 0.8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.7, 0.36, 0.3]} castShadow><boxGeometry args={[0.05, 0.72, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.7, 0.36, 0.3]} castShadow><boxGeometry args={[0.05, 0.72, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[-0.7, 0.36, -0.3]} castShadow><boxGeometry args={[0.05, 0.72, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.7, 0.36, -0.3]} castShadow><boxGeometry args={[0.05, 0.72, 0.05]} /><meshStandardMaterial color="#333" /></mesh>

        {/* --- CHAIR (Gaming Style) --- */}
        <group position={[0, 0, 0.8]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.6, 0.1, 0.6]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[0, 1.0, -0.25]} rotation={[-0.1, 0, 0]} castShadow>
                <boxGeometry args={[0.5, 1.0, 0.1]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            {/* Red Stripes on chair */}
            <mesh position={[0, 1.0, -0.24]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.1, 0.9, 0.02]} />
                <meshStandardMaterial color="red" />
            </mesh>
            <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.05, 0.05, 0.5]} /><meshStandardMaterial color="#333" /></mesh>
            <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.3, 0.3, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        </group>

        {/* --- PC SETUP --- */}
        
        {/* Monitor Stand */}
        <mesh position={[0, 0.76, -0.2]} castShadow>
            <boxGeometry args={[0.2, 0.02, 0.2]} />
            <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0.9, -0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.3]} />
            <meshStandardMaterial color="#111" />
        </mesh>

        {/* Monitor */}
        <group position={[0, 1.1, -0.2]}>
            {/* Bezel */}
            <mesh castShadow>
                <boxGeometry args={[0.8, 0.5, 0.05]} />
                <meshStandardMaterial color="#111" roughness={0.1} />
            </mesh>
            {/* Screen */}
            <mesh ref={screenRef} position={[0, 0, 0.026]}>
                <planeGeometry args={[0.75, 0.45]} />
                <meshStandardMaterial color="black" roughness={0.2} metalness={0.5} />
            </mesh>
            {/* Screen Light Emission */}
            <pointLight position={[0, 0, 0.5]} intensity={compState === 'OFF' ? 0 : 1} distance={2} color={compState === 'BLOODY' ? 'red' : 'white'} />
        </group>

        {/* PC Case (With RGB) */}
        <group position={[0.6, 1.0, -0.2]}>
            <mesh castShadow>
                <boxGeometry args={[0.25, 0.5, 0.5]} />
                <meshStandardMaterial color="#111" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Glass Panel */}
            <mesh position={[-0.13, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <planeGeometry args={[0.4, 0.4]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Internal RGB Light */}
            <pointLight position={[0, 0, 0]} color="#00ff00" intensity={0.5} distance={1} />
        </group>

        {/* Keyboard (Realistic) */}
        <group position={[0, 0.76, 0.15]} rotation={[0.1, 0, 0]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.02, 0.15]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            {/* Keys (Simplified rows) */}
            {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
                <mesh key={i} position={[x, 0.015, 0]}>
                    <boxGeometry args={[0.08, 0.015, 0.12]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            ))}
            {/* RGB underglow */}
            <pointLight position={[0, -0.05, 0]} color="cyan" intensity={0.2} distance={0.5} />
        </group>

        {/* Mouse */}
        <group position={[0.35, 0.76, 0.15]}>
            <mesh castShadow>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color="#111" roughness={0.3} />
            </mesh>
            {/* Mouse Light */}
            <pointLight position={[0, 0, 0]} color="red" intensity={0.1} distance={0.2} />
        </group>

        {/* Mousepad */}
        <mesh position={[0.35, 0.756, 0.15]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[0.2, 0.25]} />
            <meshStandardMaterial color="#333" />
        </mesh>

    </group>
  );
};

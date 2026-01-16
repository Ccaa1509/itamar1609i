
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { createTvStaticTexture, createNewsTexture } from './TextureGenerator';
import { Controls } from '../types';
import { toggleNewsSound } from './AudioEngine';
import { hauntState } from './HauntState';

interface TelevisionProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  gameMinutes: number;
  missionActive?: boolean; // Mission 10
  onScare?: () => void;
  isTvCrashed?: boolean; // New prop for glitch state
  canTurnOn?: boolean; // New prop requiring player to be in sweet spot
}

export const Television: React.FC<TelevisionProps> = ({ 
    position, rotation, gameMinutes, 
    missionActive, onScare, isTvCrashed = false, canTurnOn = true
}) => {
  const [isOn, setIsOn] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const tvRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  // Textures
  const staticTex = useMemo(() => createTvStaticTexture(), []);
  const newsTex = useMemo(() => createNewsTexture(), []);

  // Handle Audio
  useEffect(() => {
    // Play news sound if TV is on AND not crashed
    toggleNewsSound(isOn && !isTvCrashed);
    
    return () => {
        toggleNewsSound(false);
    };
  }, [isOn, isTvCrashed]);

  // Animation Loop
  useFrame((state, delta) => {
    if (tvRef.current) {
      const dist = state.camera.position.distanceTo(tvRef.current.position);
      const isClose = dist < 3.5;
      
      // CHECK: Can only interact if 20 minutes have passed in-game (12:20 AM) OR if it's the scare mission
      const timeCondition = gameMinutes >= 20 || missionActive;

      // Only show prompt if close AND time condition is met
      setShowPrompt(isClose && timeCondition && !isOn);

      if (isClose && timeCondition && !isOn) {
          if (missionActive && !canTurnOn) {
              setPromptText("לך לאמצע הסלון כדי לצפות");
          } else {
              setPromptText("[E] להדליק טלוויזיה");
          }

          if (interactPressed && !lastPress) {
              if (missionActive && !canTurnOn) {
                  // Do nothing, must stand in spot
              } else if (missionActive && onScare) {
                  // SPECIAL EVENT: Turn On and Trigger Logic
                  setIsOn(true);
                  onScare();
              } else {
                  // Normal Toggle Logic
                  const newState = !isOn;
                  setIsOn(newState);

                  // --- TRIGGER SCRIPTED EVENT (OLD) ---
                  if (newState && !hauntState.tvEventFinished && !missionActive) {
                      hauntState.triggerTvEvent = true;
                  }
              }
          }
      }
      setLastPress(interactPressed);

      // --- VISUAL LOGIC ---
      if (isOn) {
         // Normal visual update
         tvRef.current.position.lerp(new THREE.Vector3(...position), 0.1);
         
         if (screenRef.current) {
             const mat = screenRef.current.material as THREE.MeshStandardMaterial;
             
             // If crashed (triggered by App.tsx timeout), show static. Otherwise news.
             mat.map = isTvCrashed ? staticTex : newsTex;
             mat.emissiveMap = isTvCrashed ? staticTex : newsTex;
             
             // Reset Texture
             if (!isTvCrashed) {
                 newsTex.offset.y = 0;
                 newsTex.offset.x = 0;
                 newsTex.repeat.y = 1;
             }

             // Subtle flicker
             mat.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05 + (Math.random() * 0.1);
         }

         // Update the projected light
         if (lightRef.current && screenRef.current) {
             const mat = screenRef.current.material as THREE.MeshStandardMaterial;
             lightRef.current.intensity = mat.emissiveIntensity * 1.5;
             lightRef.current.color.setHex(isTvCrashed ? 0xcccccc : 0xaaaaff);
         }

      } else {
         // Reset when off
         tvRef.current.position.set(...position);
         if (screenRef.current) {
             (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
         }
      }
    }
  });

  return (
    <group ref={tvRef} position={position} rotation={rotation}>
      
      {/* MISSION MARKER */}
      {missionActive && !isOn && (
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

      {/* TV Body */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.6, 1, 0.5]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.6, 0.26]}>
        <planeGeometry args={[1.4, 0.8]} />
        <meshStandardMaterial 
            map={staticTex} 
            color={isOn ? '#ffffff' : '#111111'}
            emissive={isOn ? '#ffffff' : '#000000'}
            emissiveMap={staticTex} 
            emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>

      {/* Stand/Table */}
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 0.8]} />
        <meshStandardMaterial color="#3e2723" roughness={0.8} />
      </mesh>

      {/* Light emitted by TV when on */}
      {isOn && (
        <pointLight ref={lightRef} position={[0, 0.6, 1]} intensity={1.5} distance={7} color="#aaaaff" castShadow />
      )}

      {/* Prompt UI in 3D space */}
      {showPrompt && !isOn && (
        <Billboard position={[0, 1.4, 0]}>
            <Text 
            fontSize={0.2} 
            color={missionActive && !canTurnOn ? "red" : "lime"} 
            anchorX="center" 
            anchorY="middle"
            outlineWidth={0.02} 
            outlineColor="black"
            >
            {promptText}
            </Text>
        </Billboard>
      )}
    </group>
  );
};

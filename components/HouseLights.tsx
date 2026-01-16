
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { hauntState } from './HauntState';
import { playStaticBurst, setNewsVolume } from './AudioEngine';
import * as THREE from 'three';

interface HouseLightsProps {
    isPowerOff?: boolean;
}

export const HouseLights: React.FC<HouseLightsProps> = ({ isPowerOff = false }) => {
  const glitchTimer = useRef(0);
  const durationTimer = useRef(0);
  
  // Refs for lights to manipulate directly for performance
  const livingRoomLight = useRef<THREE.PointLight>(null);
  const kitchenLight = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  // Base intensities
  const LR_INTENSITY = 0.8;
  const K_INTENSITY = 0.7;
  const AMB_INTENSITY = 0.25;
  const HEMI_INTENSITY = 0.4;

  useFrame((state, delta) => {
      // If power is OFF (Mission 10.5), kill all lights
      if (isPowerOff) {
          if (livingRoomLight.current) livingRoomLight.current.intensity = 0;
          if (kitchenLight.current) kitchenLight.current.intensity = 0;
          if (ambientRef.current) ambientRef.current.intensity = 0.02; // Very dark
          if (hemiRef.current) hemiRef.current.intensity = 0.02;
          return;
      }

      // --- HAUNT LOGIC ---
      // 1. Cooldown
      if (glitchTimer.current > 0) {
          glitchTimer.current -= delta;
      } 

      // 2. Active Glitch Duration
      if (durationTimer.current > 0) {
          durationTimer.current -= delta;
          
          // Update Global State
          hauntState.isGlitching = true;
          hauntState.intensity = Math.random(); // Chaotic 0-1
          
          if (durationTimer.current <= 0) {
               // End of glitch
               hauntState.isGlitching = false;
               hauntState.intensity = 0;
               setNewsVolume(1); // Restore TV volume
          }
      } else {
          // 3. Trigger Logic
          // Increased probability: 0.015 (1.5% chance per frame)
          // Reduced cooldown: 2 to 7 seconds (was 5 to 20)
          if (glitchTimer.current <= 0 && Math.random() < 0.015) { 
              durationTimer.current = 0.2 + Math.random() * 0.8; // Shorter, sharper bursts (0.2s - 1.0s)
              glitchTimer.current = 2 + Math.random() * 5; 
              
              playStaticBurst(); // Trigger Sound
              setNewsVolume(0); // Cut TV Audio
          }
      }

      // --- LIGHT FLICKER LOGIC ---
      if (hauntState.isGlitching) {
          // More aggressive flickering:
          // 50% chance to be completely OFF
          // 30% chance to be DIM
          // 20% chance to be BRIGHT FLASH
          const rand = Math.random();
          const flicker = rand > 0.5 ? 0 : (rand > 0.2 ? 0.1 : 2.5); 
          
          if (livingRoomLight.current) livingRoomLight.current.intensity = LR_INTENSITY * flicker;
          if (kitchenLight.current) kitchenLight.current.intensity = K_INTENSITY * flicker;
          if (ambientRef.current) ambientRef.current.intensity = AMB_INTENSITY * flicker;
          if (hemiRef.current) hemiRef.current.intensity = HEMI_INTENSITY * flicker;

      } else {
          // Restore to normal
          if (livingRoomLight.current) livingRoomLight.current.intensity = LR_INTENSITY;
          if (kitchenLight.current) kitchenLight.current.intensity = K_INTENSITY;
          if (ambientRef.current) ambientRef.current.intensity = AMB_INTENSITY;
          if (hemiRef.current) hemiRef.current.intensity = HEMI_INTENSITY;
      }
  });

  return (
    <>
      {/* Global Lights */}
      <hemisphereLight ref={hemiRef} intensity={HEMI_INTENSITY} groundColor="#111111" color="#2a2a40" />
      <ambientLight ref={ambientRef} intensity={AMB_INTENSITY} />

      {/* Living Room Light - Warmer, brighter radius */}
      <pointLight 
        ref={livingRoomLight}
        position={[0, 3.8, 5]} 
        intensity={LR_INTENSITY} 
        distance={20} 
        decay={2}
        color="#ffccaa" 
        castShadow 
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />

      {/* Kitchen Light - Cooler, brighter radius */}
      <pointLight 
        ref={kitchenLight}
        position={[0, 3.8, -5]} 
        intensity={K_INTENSITY} 
        distance={20} 
        decay={2}
        color="#dbeeff"
        castShadow 
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
};

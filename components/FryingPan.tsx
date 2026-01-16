import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { playSizzleSound } from './AudioEngine';

interface FryingPanProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  hasEggs: boolean;
  setHasEggs: (val: boolean) => void;
  hasChicken: boolean;
  setHasChicken: (val: boolean) => void;
  setHasCookedEggs: (val: boolean) => void;
  setHasCookedChicken: (val: boolean) => void;
}

export const FryingPan: React.FC<FryingPanProps> = ({ 
    position, rotation, 
    hasEggs, setHasEggs, 
    hasChicken, setHasChicken,
    setHasCookedEggs, setHasCookedChicken
}) => {
  const [cookingItem, setCookingItem] = useState<'none' | 'eggs' | 'chicken'>('none');
  const [cookingProgress, setCookingProgress] = useState(0);
  const [isCooked, setIsCooked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  
  const panRef = useRef<THREE.Group>(null);
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state, delta) => {
      // Cooking Logic
      if (cookingItem !== 'none' && !isCooked) {
          setCookingProgress(prev => {
              const next = prev + delta;
              if (next >= 5) { // 5 seconds to cook
                  setIsCooked(true);
                  return 5;
              }
              // Play sound occasionally
              if (Math.floor(next) > Math.floor(prev)) {
                  playSizzleSound();
              }
              return next;
          });
      }

      if (panRef.current) {
          const dist = state.camera.position.distanceTo(panRef.current.position);
          const isClose = dist < 2.0;
          setShowPrompt(isClose);

          if (isClose) {
              if (cookingItem === 'none') {
                  if (hasEggs) setPromptText("[E] להכין חביתה");
                  else if (hasChicken) setPromptText("[E] להכין עוף");
                  else setPromptText("צריך ביצים או עוף");
              } else {
                  if (isCooked) {
                      setPromptText(cookingItem === 'eggs' ? "[E] לקחת חביתה" : "[E] לקחת עוף");
                  } else {
                      setPromptText(`מטגן... ${Math.ceil(5 - cookingProgress)}`);
                  }
              }

              if (interactPressed && !lastPress) {
                  if (cookingItem === 'none') {
                      if (hasEggs) {
                          setHasEggs(false);
                          setCookingItem('eggs');
                          setCookingProgress(0);
                          setIsCooked(false);
                          playSizzleSound();
                      } else if (hasChicken) {
                          setHasChicken(false);
                          setCookingItem('chicken');
                          setCookingProgress(0);
                          setIsCooked(false);
                          playSizzleSound();
                      }
                  } else if (isCooked) {
                      if (cookingItem === 'eggs') setHasCookedEggs(true);
                      if (cookingItem === 'chicken') setHasCookedChicken(true);
                      setCookingItem('none');
                      setIsCooked(false);
                      setCookingProgress(0);
                  }
              }
          }
          setLastPress(interactPressed);
      }
  });

  return (
    <group ref={panRef} position={position} rotation={rotation}>
        
      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 1.2, 0]}>
          <Text 
            fontSize={0.2} 
            color={isCooked ? "#44ff44" : "orange"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* Pan Body - Made slightly lighter and more metallic for visibility */}
      <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.2, 0.05, 32]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Pan Handle */}
      <mesh position={[0, 0.04, 0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.05, 0.02, 0.4]} />
          <meshStandardMaterial color="#222" />
      </mesh>

      {/* Food Visuals */}
      {cookingItem === 'eggs' && (
          <group position={[0, 0.05, 0]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                  <circleGeometry args={[0.18, 32]} />
                  <meshBasicMaterial color={isCooked ? "#ffffdd" : "#ffffff"} opacity={0.8} transparent />
              </mesh>
              <mesh position={[0.05, 0.01, 0.05]} rotation={[-Math.PI/2, 0, 0]}>
                  <circleGeometry args={[0.06, 32]} />
                  <meshBasicMaterial color="#ffcc00" />
              </mesh>
          </group>
      )}

      {cookingItem === 'chicken' && (
          <group position={[0, 0.08, 0]}>
              <mesh rotation={[0, 0, 0.5]}>
                   <cylinderGeometry args={[0.06, 0.04, 0.25]} />
                   <meshStandardMaterial color={isCooked ? "#8B4513" : "#ffcccc"} />
              </mesh>
              <mesh position={[0.1, 0.05, 0.1]} rotation={[0.5, 0, 0]}>
                   <sphereGeometry args={[0.08]} />
                   <meshStandardMaterial color={isCooked ? "#A0522D" : "#ffcccc"} />
              </mesh>
          </group>
      )}
    </group>
  );
};
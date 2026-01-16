import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { playCoffeeSound } from './AudioEngine';

interface CoffeeMachineProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  hasMilk: boolean;
  hasCoffee: boolean;
  setHasMilk: (val: boolean) => void;
  setHasCoffee: (val: boolean) => void;
  setHasCoffeeCup: (val: boolean) => void;
}

export const CoffeeMachine: React.FC<CoffeeMachineProps> = ({ 
    position, rotation, 
    hasMilk, hasCoffee, 
    setHasMilk, setHasCoffee, setHasCoffeeCup
}) => {
  const [brewing, setBrewing] = useState(false);
  const [cupReady, setCupReady] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  
  const machineRef = useRef<THREE.Group>(null);
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
      if (machineRef.current) {
          const dist = state.camera.position.distanceTo(machineRef.current.position);
          const isClose = dist < 2.0;
          setShowPrompt(isClose);

          if (isClose) {
              if (cupReady) {
                  setPromptText("[E] לקחת כוס קפה");
              } else if (brewing) {
                  setPromptText("מכין קפה...");
              } else if (hasMilk && hasCoffee) {
                  setPromptText("[E] להכין קפה");
              } else {
                  setPromptText("חסר חלב או קפה");
              }

              if (interactPressed && !lastPress) {
                  if (cupReady) {
                      setHasCoffeeCup(true);
                      setCupReady(false);
                  } else if (hasMilk && hasCoffee && !brewing) {
                      setHasMilk(false);
                      setHasCoffee(false);
                      setBrewing(true);
                      playCoffeeSound();
                      setTimeout(() => {
                          setBrewing(false);
                          setCupReady(true);
                      }, 4000);
                  }
              }
          }
          setLastPress(interactPressed);
      }
  });

  return (
    <group ref={machineRef} position={position} rotation={rotation}>
        
      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 1.2, 0]}>
          <Text 
            fontSize={0.2} 
            color={cupReady ? "#44ff44" : "white"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* Machine Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Spout */}
      <mesh position={[0, 0.35, 0.16]}>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="silver" />
      </mesh>

      {/* Cup (Visible when brewing or ready) */}
      {(brewing || cupReady) && (
          <group position={[0, 0.05, 0.15]}>
              <mesh>
                  <cylinderGeometry args={[0.06, 0.05, 0.1]} />
                  <meshStandardMaterial color="white" />
              </mesh>
              {/* Coffee Liquid */}
              {cupReady && (
                   <mesh position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 0]}>
                      <circleGeometry args={[0.05]} />
                      <meshBasicMaterial color="#3e2723" />
                   </mesh>
              )}
          </group>
      )}

      {/* Steam if brewing */}
      {brewing && (
           <mesh position={[0, 0.3, 0.2]}>
               <sphereGeometry args={[0.05]} />
               <meshBasicMaterial color="white" transparent opacity={0.3} />
           </mesh>
      )}

    </group>
  );
};

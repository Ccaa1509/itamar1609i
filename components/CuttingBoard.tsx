import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { playChopSound } from './AudioEngine';

interface CuttingBoardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  hasIngredients: boolean;
  setHasIngredients: (val: boolean) => void;
  setHasSalad: (val: boolean) => void;
}

export const CuttingBoard: React.FC<CuttingBoardProps> = ({ 
    position, rotation, 
    hasIngredients, setHasIngredients, 
    setHasSalad 
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isChopping, setIsChopping] = useState(false);
  const [isSaladReady, setIsSaladReady] = useState(false);
  const [promptText, setPromptText] = useState("");

  const boardRef = useRef<THREE.Group>(null);
  const knifeRef = useRef<THREE.Group>(null);
  
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state) => {
    if (boardRef.current) {
      const dist = state.camera.position.distanceTo(boardRef.current.position);
      const isClose = dist < 2.0;
      setShowPrompt(isClose);

      if (isClose) {
        if (isSaladReady) {
            setPromptText("[E] לקחת סלט");
        } else if (isChopping) {
            setPromptText("חותך...");
        } else if (hasIngredients) {
            setPromptText("[E] לחתוך ירקות");
        } else {
            setPromptText("צריך ירקות");
        }

        if (interactPressed && !lastPress) {
             if (isSaladReady) {
                 setHasSalad(true);
                 setIsSaladReady(false);
                 setPromptText("צריך ירקות");
             } else if (hasIngredients && !isChopping) {
                 setHasIngredients(false);
                 setIsChopping(true);
                 
                 // Animation sequence
                 let chops = 0;
                 const chopInterval = setInterval(() => {
                     playChopSound();
                     chops++;
                     if (chops >= 5) {
                         clearInterval(chopInterval);
                         setIsChopping(false);
                         setIsSaladReady(true);
                     }
                 }, 400);
             }
        }
      }
      setLastPress(interactPressed);

      // Knife Animation
      if (knifeRef.current) {
          if (isChopping) {
              const t = state.clock.elapsedTime * 15;
              knifeRef.current.rotation.z = -Math.PI / 8 + Math.sin(t) * 0.2;
              knifeRef.current.position.y = 0.1 + Math.abs(Math.sin(t)) * 0.05;
          } else {
              // Resting position
              knifeRef.current.rotation.z = THREE.MathUtils.lerp(knifeRef.current.rotation.z, Math.PI/2, 0.1);
              knifeRef.current.position.y = 0.03;
          }
      }
    }
  });

  return (
    <group ref={boardRef} position={position} rotation={rotation}>
        
      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 1.5, 0]}>
          <Text 
            fontSize={0.2} 
            color={isSaladReady ? "lime" : "white"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* --- BOARD --- */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.04, 0.35]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>

      {/* --- KNIFE --- */}
      <group ref={knifeRef} position={[0.3, 0.03, 0]}>
          {/* Handle */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
              <meshStandardMaterial color="black" />
          </mesh>
          {/* Blade */}
          <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.04, 0.2, 0.005]} />
              <meshStandardMaterial color="silver" metalness={0.9} roughness={0.2} />
          </mesh>
      </group>

      {/* --- VEGETABLES (Raw) --- */}
      {isChopping && (
          <group position={[0, 0.05, 0]}>
               {/* Tomato */}
               <mesh position={[-0.1, 0, 0]}>
                   <sphereGeometry args={[0.06]} />
                   <meshStandardMaterial color="red" />
               </mesh>
               {/* Cucumber */}
               <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                   <cylinderGeometry args={[0.03, 0.03, 0.15]} />
                   <meshStandardMaterial color="green" />
               </mesh>
          </group>
      )}

      {/* --- SALAD (Chopped) --- */}
      {isSaladReady && (
          <group position={[0, 0.05, 0]}>
              {/* Random chunks */}
              {Array.from({length: 8}).map((_, i) => (
                  <mesh key={i} position={[(Math.random()-0.5)*0.3, 0.02, (Math.random()-0.5)*0.2]} rotation={[Math.random(), Math.random(), Math.random()]}>
                      <boxGeometry args={[0.04, 0.04, 0.04]} />
                      <meshStandardMaterial color={Math.random() > 0.5 ? "red" : "green"} />
                  </mesh>
              ))}
               {/* Oil sheen */}
               <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
                   <planeGeometry args={[0.3, 0.2]} />
                   <meshStandardMaterial color="#dddd00" transparent opacity={0.3} roughness={0.1} />
               </mesh>
          </group>
      )}

    </group>
  );
};
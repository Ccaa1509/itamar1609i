import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../types';
import { playOvenDing } from './AudioEngine';

interface OvenProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  hasFood: boolean;
  setHasFood: (val: boolean) => void;
  setIsFoodCooked: (val: boolean) => void;
}

export const Oven: React.FC<OvenProps> = ({ position, rotation, hasFood, setHasFood, setIsFoodCooked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [foodInside, setFoodInside] = useState(false);
  const [isCooked, setIsCooked] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const cookingTimer = useRef(0);
  const doorRef = useRef<THREE.Group>(null);
  const ovenRef = useRef<THREE.Group>(null);

  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  useFrame((state, delta) => {
    // 1. Cooking Logic
    if (isOn && foodInside && !isCooked) {
        cookingTimer.current += delta;
        
        // Check if ready (5 seconds)
        if (cookingTimer.current >= 5) {
            setIsOn(false);
            setIsCooked(true);
            playOvenDing();
            cookingTimer.current = 0;
        }
    }

    // 2. Interaction
    if (ovenRef.current) {
      const dist = state.camera.position.distanceTo(ovenRef.current.position);
      const isClose = dist < 2.5;
      setShowPrompt(isClose);

      if (isClose) {
        // Logic for prompts
        if (isOpen) {
            if (hasFood) {
                setPromptText("[E] להכניס פיצה");
            } else if (foodInside && isCooked) {
                // Can only take if cooked
                setPromptText("[E] לקחת פיצה מוכנה!");
            } else {
                // If empty OR food is inside but raw -> Close only
                setPromptText("[E] לסגור");
            }
        } else {
            // Closed
            if (foodInside) {
                if (isOn) {
                    // Show countdown
                    const timeLeft = Math.ceil(5 - cookingTimer.current);
                    setPromptText(`מכין... (${timeLeft})`); 
                } else {
                    if (isCooked) {
                         setPromptText("[E] לפתוח (מוכן!)");
                    } else {
                         setPromptText("[E] להדליק תנור");
                    }
                }
            } else {
                setPromptText("[E] לפתוח");
            }
        }

        if (interactPressed && !lastPress) {
             if (isOpen) {
                 if (hasFood) {
                     // Place food in
                     setHasFood(false);
                     setFoodInside(true);
                     setIsCooked(false); // New pizza is raw
                     cookingTimer.current = 0;
                 } else if (foodInside && isCooked) {
                     // Take food out ONLY if cooked
                     setHasFood(true);
                     setIsFoodCooked(true); // Player now has cooked food
                     setFoodInside(false);
                 } else {
                     // Otherwise close door (includes case where raw food is inside)
                     setIsOpen(false);
                 }
             } else {
                 // Closed
                 if (foodInside) {
                     if (isOn) {
                         // Cancel cooking
                         setIsOn(false);
                         cookingTimer.current = 0;
                     } else {
                         // If cooked, open to retrieve. If raw, turn on.
                         if (isCooked) {
                            setIsOpen(true);
                         } else {
                            setIsOn(true);
                         }
                     }
                 } else {
                     setIsOpen(true);
                 }
             }
        }
      }
      setLastPress(interactPressed);
    }

    // 3. Door Animation (Rotate X axis, hinge at bottom)
    if (doorRef.current) {
        const targetRot = isOpen ? Math.PI / 2.5 : 0;
        doorRef.current.rotation.x = THREE.MathUtils.lerp(doorRef.current.rotation.x, targetRot, 5 * delta);
    }
  });

  return (
    <group ref={ovenRef} position={position} rotation={rotation}>
        
      {/* UI Prompt */}
      {showPrompt && (
        <Billboard position={[0, 1.5, 0]}>
          <Text 
            fontSize={0.25} 
            color={isCooked && foodInside && !isOn ? "#44ff44" : "orange"} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* --- OVEN BODY --- */}
      {/* Main Box */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.9, 0.8]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Burners on top */}
      <mesh position={[-0.2, 0.91, -0.2]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[0.1, 0.15, 32]} />
          <meshStandardMaterial color="black" />
      </mesh>
       <mesh position={[0.2, 0.91, 0.2]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[0.1, 0.15, 32]} />
          <meshStandardMaterial color="black" />
      </mesh>

      {/* --- INTERIOR --- */}
      {/* Dark inside */}
      <mesh position={[0, 0.5, 0.05]}>
          <boxGeometry args={[0.7, 0.6, 0.6]} />
          <meshStandardMaterial color="#111" />
      </mesh>

      {/* Food Mesh (Inside) */}
      {foodInside && (
          <group position={[0, 0.3, 0]}>
              <mesh>
                  <boxGeometry args={[0.3, 0.05, 0.3]} />
                  <meshStandardMaterial color="#dd9955" /> {/* Crust */}
              </mesh>
              {/* Toppings / Cheese */}
               <mesh position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
                 <planeGeometry args={[0.28, 0.28]} />
                 <meshBasicMaterial 
                    color={isOn ? "#ff4400" : (isCooked ? "#ffcc00" : "red")} 
                 /> 
                 {/* Raw = Red Sauce, On = Glowing Red/Orange, Cooked = Golden Cheese */}
              </mesh>
              
              {/* Steam Particles if cooked and open */}
              {isCooked && isOpen && (
                  <mesh position={[0, 0.2, 0]}>
                      <sphereGeometry args={[0.1]} />
                      <meshBasicMaterial color="white" transparent opacity={0.3} />
                  </mesh>
              )}
          </group>
      )}

      {/* Heating Light */}
      {isOn && (
          <pointLight position={[0, 0.5, 0]} color="orange" intensity={2} distance={3} />
      )}

      {/* --- DOOR (Hinged at bottom) --- */}
      <group ref={doorRef} position={[0, 0.1, 0.4]}>
          {/* Frame */}
          <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.9, 0.8, 0.05]} />
              <meshStandardMaterial color="#444" metalness={0.7} />
          </mesh>
          {/* Glass Window */}
          <mesh position={[0, 0.4, 0.026]}>
              <planeGeometry args={[0.6, 0.5]} />
              <meshStandardMaterial 
                color="black" 
                transparent 
                opacity={0.7} 
                roughness={0} 
                metalness={0.9} 
              />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0.7, 0.05]}>
              <boxGeometry args={[0.6, 0.05, 0.05]} />
              <meshStandardMaterial color="#888" />
          </mesh>
      </group>

    </group>
  );
};

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { createFridgeNoteTexture } from './TextureGenerator';
import { Controls } from '../types';

interface FridgeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  hasFood: boolean;
  setHasFood: (val: boolean) => void;
  setIsFoodCooked: (val: boolean) => void;
  hasIngredients: boolean;
  setHasIngredients: (val: boolean) => void;
  
  // New props
  hasEggs: boolean;
  setHasEggs: (val: boolean) => void;
  hasChicken: boolean;
  setHasChicken: (val: boolean) => void;
  hasMilk: boolean;
  setHasMilk: (val: boolean) => void;
  hasCoffee: boolean;
  setHasCoffee: (val: boolean) => void;
  
  // Mission props
  isHighlighted?: boolean;
  onOpen?: () => void;
}

interface FridgeItem {
    label: string;
    condition: boolean;
    action: () => void;
}

export const Refrigerator: React.FC<FridgeProps> = ({ 
    position, rotation, 
    hasFood, setHasFood, setIsFoodCooked,
    hasIngredients, setHasIngredients,
    hasEggs, setHasEggs,
    hasChicken, setHasChicken,
    hasMilk, setHasMilk,
    hasCoffee, setHasCoffee,
    isHighlighted,
    onOpen
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  
  // Selection state for cycling
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const doorGroupRef = useRef<THREE.Group>(null);
  const fridgeRef = useRef<THREE.Group>(null);
  
  // Controls
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const cyclePressed = useKeyboardControls<keyof Controls>(state => state.cycle);
  const [lastPress, setLastPress] = useState(false);
  const [lastCycle, setLastCycle] = useState(false);

  // Note Texture
  const noteTexture = useMemo(() => createFridgeNoteTexture(), []);

  // Effect to call onOpen prop when opened
  useEffect(() => {
      if (isOpen && onOpen) {
          onOpen();
      }
  }, [isOpen, onOpen]);

  useFrame((state, delta) => {
    // 1. Determine available items
    const availableItems: FridgeItem[] = [
        { label: 'ירקות לסלט', condition: !hasIngredients, action: () => setHasIngredients(true) },
        { label: 'פיצה', condition: !hasFood, action: () => { setHasFood(true); setIsFoodCooked(false); } },
        { label: 'ביצים', condition: !hasEggs, action: () => setHasEggs(true) },
        { label: 'כרעיים', condition: !hasChicken, action: () => setHasChicken(true) },
        { label: 'חלב', condition: !hasMilk, action: () => setHasMilk(true) },
        { label: 'קפה', condition: !hasCoffee, action: () => setHasCoffee(true) },
    ].filter(i => i.condition);

    // 2. Logic
    if (fridgeRef.current) {
      const dist = state.camera.position.distanceTo(fridgeRef.current.position);
      const isClose = dist < 3.0;
      setShowPrompt(isClose);

      if (isClose) {
        // Handle Cycling
        if (cyclePressed && !lastCycle) {
            setSelectedIndex(prev => prev + 1);
        }

        if (!isOpen) {
            setPromptText("[E] לפתוח מקרר");
            // Simple Open
            if (interactPressed && !lastPress) {
                setIsOpen(true);
            }
        } else {
            // Fridge Open
            if (availableItems.length > 0) {
                const currentItem = availableItems[selectedIndex % availableItems.length];
                setPromptText(`[E] לקחת ${currentItem.label}\n[L] דפדף במצרכים`);

                if (interactPressed && !lastPress) {
                    currentItem.action();
                }
            } else {
                setPromptText("[E] לסגור (ריק)");
                if (interactPressed && !lastPress) {
                    setIsOpen(false);
                }
            }
        }
      }
      setLastPress(interactPressed);
      setLastCycle(cyclePressed);
    }

    // 3. Animation
    if (doorGroupRef.current) {
      const targetRotation = isOpen ? Math.PI / 1.5 : 0;
      doorGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        doorGroupRef.current.rotation.y, 
        targetRotation, 
        5 * delta
      );
    }
  });

  return (
    <group ref={fridgeRef} position={position} rotation={rotation}>
      
      {/* MISSION MARKER */}
      {isHighlighted && (
          <Billboard position={[0, 3.2, 0]}>
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

      {showPrompt && (
        <Billboard position={[0, 2.6, 0]}>
          <Text 
            fontSize={0.2} 
            color="red" 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
            textAlign="center"
          >
            {promptText}
          </Text>
        </Billboard>
      )}

      {/* BODY */}
      <mesh position={[0, 1, -0.45]} castShadow receiveShadow><boxGeometry args={[1, 2, 0.1]} /><meshStandardMaterial color="#e0e0e0" roughness={0.2} /></mesh>
      <mesh position={[-0.45, 1, 0]} castShadow receiveShadow><boxGeometry args={[0.1, 2, 1]} /><meshStandardMaterial color="#e0e0e0" roughness={0.2} /></mesh>
      <mesh position={[0.45, 1, 0]} castShadow receiveShadow><boxGeometry args={[0.1, 2, 1]} /><meshStandardMaterial color="#e0e0e0" roughness={0.2} /></mesh>
      <mesh position={[0, 1.95, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#e0e0e0" roughness={0.2} /></mesh>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#222" /></mesh>

      {/* SHELVES */}
      <mesh position={[0, 1.2, 0]}><boxGeometry args={[0.8, 0.02, 0.8]} /><meshStandardMaterial color="#ccffff" transparent opacity={0.5} /></mesh>
      <mesh position={[0, 0.7, 0]}><boxGeometry args={[0.8, 0.02, 0.8]} /><meshStandardMaterial color="#ccffff" transparent opacity={0.5} /></mesh>

      {/* --- ITEMS --- */}
      
      {/* Milk (Top Shelf Left) */}
      {!hasMilk && (
          <group position={[-0.25, 1.35, -0.1]}>
             <mesh castShadow><boxGeometry args={[0.12, 0.25, 0.12]} /><meshStandardMaterial color="#ffffff" /></mesh>
             <mesh position={[0, 0.05, 0.061]}><planeGeometry args={[0.08, 0.08]} /><meshBasicMaterial color="blue" /></mesh>
          </group>
      )}

      {/* Coffee Jar (Top Shelf Right) */}
      {!hasCoffee && (
          <group position={[0.25, 1.3, -0.1]}>
             <mesh castShadow><cylinderGeometry args={[0.08, 0.08, 0.15]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.08, 0.08, 0.02]} /><meshStandardMaterial color="#111" /></mesh>
             <mesh position={[0, 0, 0.081]}><planeGeometry args={[0.08, 0.05]} /><meshBasicMaterial color="#d7ccc8" /></mesh>
          </group>
      )}

      {/* Pizza (Top Shelf Center) */}
      {!hasFood && (
          <group position={[0, 1.25, 0.2]}>
              <mesh castShadow><boxGeometry args={[0.3, 0.05, 0.3]} /><meshStandardMaterial color="#dd9955" /></mesh>
              <mesh position={[0, 0.026, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[0.28, 0.28]} /><meshBasicMaterial color="red" /></mesh>
          </group>
      )}

      {/* Eggs (Bottom Shelf Left) */}
      {!hasEggs && (
          <group position={[-0.2, 0.75, 0]}>
              <mesh castShadow><boxGeometry args={[0.25, 0.08, 0.15]} /><meshStandardMaterial color="#d3d3d3" /></mesh>
              {/* Individual egg bumps */}
              <mesh position={[-0.05, 0.04, 0]}><sphereGeometry args={[0.035]} /><meshStandardMaterial color="#fff" /></mesh>
              <mesh position={[0.05, 0.04, 0]}><sphereGeometry args={[0.035]} /><meshStandardMaterial color="#fff" /></mesh>
          </group>
      )}

      {/* Chicken (Bottom Shelf Center) */}
      {!hasChicken && (
          <group position={[0.1, 0.75, 0.1]}>
              <mesh rotation={[0,0.5,0]}><sphereGeometry args={[0.1]} /><meshStandardMaterial color="#ffcccc" roughness={0.5} /></mesh>
          </group>
      )}

      {/* Salad Ingredients (Bottom Shelf Right) */}
      {!hasIngredients && (
          <group position={[0.3, 0.75, -0.1]}>
              <mesh position={[-0.05, 0, 0]}><sphereGeometry args={[0.07]} /><meshStandardMaterial color="red" /></mesh>
              <mesh position={[0.05, 0, 0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.03, 0.03, 0.15]} /><meshStandardMaterial color="green" /></mesh>
          </group>
      )}

      <pointLight position={[0, 1.8, 0]} intensity={isOpen ? 0.8 : 0} color="#ccffff" distance={2} decay={2} />

      <group ref={doorGroupRef} position={[0.5, 1, 0.5]}>
        <mesh position={[-0.5, 0, 0]} castShadow receiveShadow><boxGeometry args={[1, 1.9, 0.1]} /><meshStandardMaterial color="#f0f0f0" roughness={0.1} metalness={0.1} /></mesh>
        <mesh position={[-0.9, 0, 0.08]}><boxGeometry args={[0.05, 0.4, 0.05]} /><meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[-0.5, 0.2, -0.06]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.3, 0.3]} /><meshBasicMaterial map={noteTexture} /></mesh>
      </group>

    </group>
  );
};

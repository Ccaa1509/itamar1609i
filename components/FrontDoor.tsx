
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { createWoodTexture } from './TextureGenerator';
import { Controls } from '../types';

interface FrontDoorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isBarricaded: boolean;
  onBarricade: () => void;
  missionActive: boolean;
  canInvestigate?: boolean;
  onInvestigate?: () => void; // Triggered by Y
  onIgnore?: () => void;      // Triggered by E
  onClose?: () => void;       // For initial mission
}

const DoorPanel: React.FC<{position: [number, number, number], size: [number, number, number]}> = ({position, size}) => (
    <group position={position}>
        {/* Recessed center */}
        <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[size[0], size[1], size[2]]} />
            <meshStandardMaterial color="#2d1b15" roughness={0.7} />
        </mesh>
        {/* Beveled Edges (simulated by box borders) */}
        {/* Top */}
        <mesh position={[0, size[1]/2, 0]}>
            <boxGeometry args={[size[0] + 0.04, 0.04, 0.03]} />
            <meshStandardMaterial color="#4e2c22" />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -size[1]/2, 0]}>
            <boxGeometry args={[size[0] + 0.04, 0.04, 0.03]} />
            <meshStandardMaterial color="#4e2c22" />
        </mesh>
        {/* Left */}
        <mesh position={[-size[0]/2, 0, 0]}>
            <boxGeometry args={[0.04, size[1], 0.03]} />
            <meshStandardMaterial color="#4e2c22" />
        </mesh>
        {/* Right */}
        <mesh position={[size[0]/2, 0, 0]}>
            <boxGeometry args={[0.04, size[1], 0.03]} />
            <meshStandardMaterial color="#4e2c22" />
        </mesh>
    </group>
);

export const FrontDoor: React.FC<FrontDoorProps> = ({ 
    position, rotation, 
    isBarricaded, onBarricade, missionActive,
    canInvestigate = false, onInvestigate, onIgnore, onClose
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  // Start open for effect
  const [isOpen, setIsOpen] = useState(true); 
  const doorRef = useRef<THREE.Group>(null);
  const doorPivot = useRef<THREE.Group>(null);
  const highlightRef = useRef<THREE.Mesh>(null);
  
  const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
  const [lastPress, setLastPress] = useState(false);

  const woodTexture = useMemo(() => createWoodTexture(), []);

  useFrame((state, delta) => {
    if (doorRef.current) {
      const dist = state.camera.position.distanceTo(doorRef.current.position);
      const isClose = dist < 3.0;
      setShowPrompt(isClose);

      // Pulse Highlight
      if (missionActive && highlightRef.current && !isBarricaded) {
          const mat = highlightRef.current.material;
          if (mat && !Array.isArray(mat)) {
            (mat as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
          }
      }

      if (isClose) {
        // Priority Logic for Prompts
        if (canInvestigate) {
            setPromptText(""); 
        } else if (isBarricaded) {
            setPromptText("הדלת חסומה ובטוחה");
        } else if (isOpen) {
            setPromptText("[E] לסגור דלת כניסה");
            if (interactPressed && !lastPress) {
                setIsOpen(false);
                if (onClose) onClose();
            }
        } else if (missionActive && !isOpen) {
            // Mission 7: Barricade (only if closed)
            setPromptText("[E] לחסום את הדלת עם קרשים");
            if (interactPressed && !lastPress) {
                onBarricade();
            }
        } else {
            setPromptText("דלת נעולה");
        }
      }
      setLastPress(interactPressed);
    }

    // Animation
    if (doorPivot.current) {
        // Open rotates around Y axis. 
        // 0 is closed. Math.PI/2.2 is open inward.
        // Or outward depending on pivot.
        const targetRot = isOpen ? -Math.PI / 2.5 : 0;
        doorPivot.current.rotation.y = THREE.MathUtils.lerp(doorPivot.current.rotation.y, targetRot, 5 * delta);
    }
  });

  return (
    <group ref={doorRef} position={position} rotation={rotation}>
      
      {/* UI Prompt - Moved to negative Z (Inside) to avoid wall clipping */}
      {showPrompt && promptText && (
        <Billboard position={[0, 2.5, -0.6]}>
          <Text 
            fontSize={0.22} 
            color={canInvestigate ? "red" : (isBarricaded ? "#44ff44" : "red")} 
            outlineWidth={0.02} 
            outlineColor="black"
            material-depthTest={false}
            renderOrder={999}
          >
            {promptText}
          </Text>
        </Billboard>
      )}
      
      {/* MISSION MARKER - Moved to negative Z (Inside) */}
      {(missionActive && !isBarricaded && !canInvestigate) ? (
          <Billboard position={[0, 3.2, -0.6]}>
              <Text 
                fontSize={0.6} 
                color="yellow" 
                outlineWidth={0.02} 
                outlineColor="black"
                material-depthTest={false}
                renderOrder={999}
              >
                ▼
              </Text>
          </Billboard>
      ) : null}

      {/* Frame */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
         <boxGeometry args={[1.4, 0.1, 0.2]} />
         <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.65, 1, 0]} castShadow receiveShadow>
         <boxGeometry args={[0.1, 2.2, 0.2]} />
         <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.65, 1, 0]} castShadow receiveShadow>
         <boxGeometry args={[0.1, 2.2, 0.2]} />
         <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Pivot Group for Animation */}
      <group ref={doorPivot} position={[0.6, 0, 0.05]}> 
          {/* The Door (Offset to hinge at edge) */}
          <group position={[-0.6, 1, 0]}>
              <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.2, 2.0, 0.1]} />
                  <meshStandardMaterial map={woodTexture} color="#3e2723" roughness={0.6} />
              </mesh>
              
              {/* Decorative Panels - On Inside Surface (Negative Z) */}
              <DoorPanel position={[0, 0.5, -0.051]} size={[0.8, 0.7, 0.02]} />
              <DoorPanel position={[0, -0.5, -0.051]} size={[0.8, 0.7, 0.02]} />

              {/* Peephole */}
              <mesh position={[0, 0.5, -0.06]} rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.02]} />
                  <meshStandardMaterial color="#gold" metalness={1} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.5, -0.071]}>
                  <circleGeometry args={[0.015]} />
                  <meshStandardMaterial color="black" roughness={0} metalness={1} />
              </mesh>

              {/* Handle - Inside */}
              <group position={[-0.45, 0, -0.08]}>
                  {/* Base */}
                  <mesh>
                      <boxGeometry args={[0.05, 0.12, 0.02]} />
                      <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.2} />
                  </mesh>
                  {/* Lever */}
                  <mesh position={[0.05, 0, -0.04]} rotation={[0, 0, -0.2]}>
                      <boxGeometry args={[0.12, 0.02, 0.02]} />
                      <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.2} />
                  </mesh>
              </group>

              {/* Deadbolt Lock (Visual) - Inside */}
              <mesh position={[-0.45, 0.15, -0.06]} rotation={[Math.PI/2, 0, 0]}>
                   <cylinderGeometry args={[0.03, 0.03, 0.05]} />
                   <meshStandardMaterial color="#gold" metalness={0.8} />
              </mesh>

              {/* Mission Highlight Outline - On Inside */}
              {missionActive && !isBarricaded && !canInvestigate && (
                  <mesh ref={highlightRef} position={[0, 0, -0.06]}>
                      <planeGeometry args={[1.25, 2.05]} />
                      <meshBasicMaterial color="yellow" transparent opacity={0.3} side={THREE.DoubleSide} />
                  </mesh>
              )}
          </group>
      </group>

      {/* --- WOOD PILE (On Floor) --- */}
      {!isBarricaded && (
          <group position={[1.5, 0.1, 1.0]} rotation={[0, 0.5, 0]}>
              <mesh position={[0, 0, 0]} castShadow rotation={[0, 0.2, 0.05]}>
                  <boxGeometry args={[0.2, 0.05, 1.2]} />
                  <meshStandardMaterial map={woodTexture} />
              </mesh>
               <mesh position={[0.1, 0.05, 0.1]} castShadow rotation={[0, -0.1, 0]}>
                  <boxGeometry args={[0.2, 0.05, 1.2]} />
                  <meshStandardMaterial map={woodTexture} />
              </mesh>
               <mesh position={[-0.05, 0.1, -0.1]} castShadow rotation={[0, 0.1, -0.05]}>
                  <boxGeometry args={[0.2, 0.05, 1.2]} />
                  <meshStandardMaterial map={woodTexture} />
              </mesh>
              {missionActive && !canInvestigate && !isOpen && (
                  <Billboard position={[0, 0.5, 0]}>
                       <Text fontSize={0.2} color="yellow" outlineWidth={0.02} outlineColor="black">קרשים</Text>
                  </Billboard>
              )}
          </group>
      )}

      {/* --- BARRICADE (Planks on Door) --- */}
      {/* Moved to Negative Z to be on the inside face */}
      {isBarricaded && (
          <group position={[0, 0, -0.15]}>
              {/* Plank 1 */}
              <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0.1]} castShadow>
                  <boxGeometry args={[1.4, 0.15, 0.05]} />
                  <meshStandardMaterial map={woodTexture} />
              </mesh>
               {/* Nails visible from inside */}
               <mesh position={[-0.6, 1.5, -0.03]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.01, 0.01, 0.05]} /><meshStandardMaterial color="black" /></mesh>
               <mesh position={[0.6, 1.55, -0.03]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.01, 0.01, 0.05]} /><meshStandardMaterial color="black" /></mesh>

              {/* Plank 2 */}
              <mesh position={[0, 0.8, 0]} rotation={[0, 0, -0.05]} castShadow>
                  <boxGeometry args={[1.4, 0.15, 0.05]} />
                  <meshStandardMaterial map={woodTexture} />
              </mesh>
               <mesh position={[-0.6, 0.82, -0.03]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.01, 0.01, 0.05]} /><meshStandardMaterial color="black" /></mesh>
               <mesh position={[0.6, 0.78, -0.03]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.01, 0.01, 0.05]} /><meshStandardMaterial color="black" /></mesh>

              {/* Plank 3 (Diagonal) */}
              <mesh position={[0, 1.15, 0.06]} rotation={[0, 0, 0.6]} castShadow>
                  <boxGeometry args={[1.6, 0.15, 0.05]} />
                  <meshStandardMaterial map={woodTexture} />
              </mesh>
          </group>
      )}

    </group>
  );
};

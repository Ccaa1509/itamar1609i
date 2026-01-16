
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { hauntState } from './HauntState';
import { playUltimateJumpscare, playWhisper } from './AudioEngine';
import { createNevoFaceTexture } from './TextureGenerator';

export enum MonsterState {
    HIDDEN,
    STALKING_BEHIND, // Text visible, Monster Invisible
    ATTACKING        // Monster Visible (Jumpscare)
}

export const KillerShadow: React.FC<{ 
    position: [number, number, number], 
    rotation?: [number, number, number],
    forceState?: MonsterState
}> = ({ position, rotation, forceState }) => {
  const { camera } = useThree();
  const [state, setState] = useState<MonsterState>(MonsterState.HIDDEN);
  
  const monsterRef = useRef<THREE.Group>(null);
  const faceTexture = useMemo(() => createNevoFaceTexture(), []);
  
  // Position behind the player (The trigger zone)
  const triggerPosition = useRef(new THREE.Vector3());
  
  // Animation timers
  const attackTimer = useRef(0);
  const hasScreamed = useRef(false);
  const textPulseRef = useRef(0);
  const hasWhispered = useRef(false);

  // Apply forced state if provided
  useEffect(() => {
      if (forceState !== undefined) {
          setState(forceState);
      }
  }, [forceState]);

  useFrame((stateThree, delta) => {
      // If forced state is active (like in bathroom), skip standard stalking logic
      if (forceState !== undefined) {
          if (forceState === MonsterState.ATTACKING && monsterRef.current) {
               // Just animate the monster in place
               const s = 1.0 + Math.sin(stateThree.clock.elapsedTime * 2) * 0.05;
               monsterRef.current.scale.set(s, s, s);
               // Look at player
               monsterRef.current.lookAt(camera.position);
          }
          return;
      }

      // 1. Check Scripted Trigger
      // Only triggered if TV set it to true, and we haven't finished the event yet
      if (hauntState.triggerTvEvent && !hauntState.tvEventFinished) {
          if (state === MonsterState.HIDDEN) {
              setState(MonsterState.STALKING_BEHIND);
              
              if (!hasWhispered.current) {
                  playWhisper(); // Play only once
                  hasWhispered.current = true;
              }

              // Calculate position directly behind player for the trigger check
              const playerPos = camera.position.clone();
              const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion).normalize();
              // The invisible monster is 3 meters behind
              triggerPosition.current.copy(playerPos.add(backward.multiplyScalar(3.0)));
              
              // Reset attack vars
              hasScreamed.current = false;
              attackTimer.current = 0;
          }
      }

      // 2. Logic: Stalking (Check if player turns around)
      if (state === MonsterState.STALKING_BEHIND) {
          textPulseRef.current += delta * 5;

          // Check alignment
          const toTrigger = triggerPosition.current.clone().sub(camera.position).normalize();
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
          
          // If player looks roughly towards the invisible trigger point behind them
          if (forward.dot(toTrigger) > 0.7) {
              setState(MonsterState.ATTACKING);
              attackTimer.current = 0;
          }
      }

      // 3. Logic: Attacking (The Jumpscare)
      if (state === MonsterState.ATTACKING) {
          attackTimer.current += delta;
          
          // Lock monster in front of camera
          if (monsterRef.current) {
              const playerPos = camera.position.clone();
              const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
              
              // Very close (0.35m) - IN YOUR FACE
              const scarePos = playerPos.add(forward.multiplyScalar(0.4));
              scarePos.y = camera.position.y - 0.1;
              
              // Violent Shaking
              scarePos.x += (Math.random() - 0.5) * 0.08;
              scarePos.y += (Math.random() - 0.5) * 0.08;
              
              monsterRef.current.position.copy(scarePos);
              monsterRef.current.lookAt(camera.position);
          }

          if (!hasScreamed.current) {
              playUltimateJumpscare(); 
              hasScreamed.current = true;
          }

          // End jumpscare very quickly
          if (attackTimer.current > 0.8) {
              setState(MonsterState.HIDDEN);
              hasWhispered.current = false;
              hauntState.triggerTvEvent = false;
              hauntState.tvEventFinished = true;
          }
      }
  });

  return (
    <>
        {/* --- THE TEXT "TURN AROUND" --- */}
        {state === MonsterState.STALKING_BEHIND && (
             <group position={camera.position} rotation={camera.rotation}>
                 <group position={[0, 0, -0.5]}>
                    <Text 
                        color="red" 
                        fontSize={0.1 + Math.sin(textPulseRef.current) * 0.02}
                        anchorX="center" 
                        anchorY="middle"
                        outlineColor="black"
                        outlineWidth={0.01}
                        fillOpacity={0.8}
                    >
                        תסתובב...
                    </Text>
                 </group>
             </group>
        )}

        {/* --- THE MONSTER (NEVO) --- */}
        {state === MonsterState.ATTACKING && (
            <group ref={monsterRef} position={position} rotation={rotation}>
                {/* The Face Billboard */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[0.6, 0.6]} />
                    <meshBasicMaterial map={faceTexture} transparent side={THREE.DoubleSide} />
                </mesh>
                
                {/* Body (Simple dark hoodie shape below) */}
                <mesh position={[0, -0.6, 0]}>
                    <cylinderGeometry args={[0.2, 0.4, 0.8, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                {/* Intense Red Glow */}
                <pointLight distance={3} intensity={5} color="#ff0000" position={[0, 0, 0.5]} decay={2} />
            </group>
        )}
    </>
  );
};

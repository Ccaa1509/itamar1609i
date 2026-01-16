import React, { useMemo } from 'react';
import { createWoodTexture } from './TextureGenerator';
import * as THREE from 'three';

export const Nightstand: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation }) => {
  const woodTexture = useMemo(() => createWoodTexture(), []);

  return (
    <group position={position} rotation={rotation}>
       {/* Legs */}
       <mesh position={[-0.2, 0.1, -0.2]} castShadow><boxGeometry args={[0.05, 0.2, 0.05]} /><meshStandardMaterial color="#2a1a10" /></mesh>
       <mesh position={[0.2, 0.1, -0.2]} castShadow><boxGeometry args={[0.05, 0.2, 0.05]} /><meshStandardMaterial color="#2a1a10" /></mesh>
       <mesh position={[-0.2, 0.1, 0.2]} castShadow><boxGeometry args={[0.05, 0.2, 0.05]} /><meshStandardMaterial color="#2a1a10" /></mesh>
       <mesh position={[0.2, 0.1, 0.2]} castShadow><boxGeometry args={[0.05, 0.2, 0.05]} /><meshStandardMaterial color="#2a1a10" /></mesh>

       {/* Main Box */}
       <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
         <boxGeometry args={[0.5, 0.5, 0.5]} />
         <meshStandardMaterial map={woodTexture} color="#5d4037" />
       </mesh>

       {/* Drawers */}
       {/* Top Drawer */}
       <mesh position={[0, 0.55, 0.26]}>
         <boxGeometry args={[0.4, 0.18, 0.02]} />
         <meshStandardMaterial color="#4e342e" />
       </mesh>
       <mesh position={[0, 0.55, 0.28]}>
         <sphereGeometry args={[0.025]} />
         <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
       </mesh>

       {/* Bottom Drawer */}
       <mesh position={[0, 0.35, 0.26]}>
         <boxGeometry args={[0.4, 0.18, 0.02]} />
         <meshStandardMaterial color="#4e342e" />
       </mesh>
       <mesh position={[0, 0.35, 0.28]}>
         <sphereGeometry args={[0.025]} />
         <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
       </mesh>
    </group>
  );
};

import React from 'react';
import { DoubleSide } from 'three';

interface WindowProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
}

export const Window: React.FC<WindowProps> = ({ position, rotation, size = [1.5, 1.5] }) => {
  const [width, height] = size;
  const frameThickness = 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* Frame Top */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, 0.15]} />
        <meshStandardMaterial color="#2d1b15" />
      </mesh>
      {/* Frame Bottom */}
      <mesh position={[0, -height / 2, 0]} castShadow>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, 0.15]} />
        <meshStandardMaterial color="#2d1b15" />
      </mesh>
      {/* Frame Left */}
      <mesh position={[-width / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, height, 0.15]} />
        <meshStandardMaterial color="#2d1b15" />
      </mesh>
      {/* Frame Right */}
      <mesh position={[width / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, height, 0.15]} />
        <meshStandardMaterial color="#2d1b15" />
      </mesh>

      {/* Cross Bars (Mullions) */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.05, height, 0.05]} />
        <meshStandardMaterial color="#2d1b15" />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[width, 0.05, 0.05]} />
        <meshStandardMaterial color="#2d1b15" />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
            color="#111122" 
            transparent 
            opacity={0.4} 
            roughness={0} 
            metalness={0.9} 
            side={DoubleSide}
        />
      </mesh>
      
      {/* Moonlight / Streetlight effect */}
      <pointLight position={[0, 0, -2]} intensity={1} distance={10} color="#334455" />
    </group>
  );
};

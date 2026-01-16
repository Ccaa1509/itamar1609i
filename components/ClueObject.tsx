
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, useKeyboardControls } from '@react-three/drei';
import { Controls } from '../types';
import * as THREE from 'three';

interface ClueObjectProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    id: number;
    isCollected: boolean;
    onCollect: (id: number) => void;
}

export const ClueObject: React.FC<ClueObjectProps> = ({ position, rotation, id, isCollected, onCollect }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const ref = useRef<THREE.Group>(null);
    const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
    const [lastPress, setLastPress] = useState(false);

    useFrame((state) => {
        if (isCollected || !ref.current) return;

        const dist = state.camera.position.distanceTo(ref.current.position);
        const isClose = dist < 2.0;
        setShowPrompt(isClose);

        if (isClose && interactPressed && !lastPress) {
            onCollect(id);
        }
        setLastPress(interactPressed);

        // Gentle float animation
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    });

    if (isCollected) return null;

    return (
        <group ref={ref} position={position} rotation={rotation}>
            {/* Paper Mesh */}
            <mesh castShadow receiveShadow rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.3, 0.4]} />
                <meshStandardMaterial color="#ffffee" side={THREE.DoubleSide} />
            </mesh>
            
            {/* Writing on paper */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.2, 0.1]} />
                <meshBasicMaterial color="#000" />
            </mesh>

            {/* Prompt */}
            {showPrompt && (
                <Billboard position={[0, 0.5, 0]}>
                    <Text
                        fontSize={0.2}
                        color="yellow"
                        outlineWidth={0.02}
                        outlineColor="black"
                        renderOrder={999}
                        material-depthTest={false}
                    >
                        [E] קח רמז
                    </Text>
                </Billboard>
            )}
            
            {/* Highlight particle */}
            <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.02]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
        </group>
    );
};

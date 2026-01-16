
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DoubleSide } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, useKeyboardControls } from '@react-three/drei';
import { createWoodTexture, createWallTexture, createRugTexture, createBedroomRugTexture, createTileTexture, createBloodTexture } from './TextureGenerator';
import { Television } from './Television';
import { Sofa } from './Sofa';
import { Refrigerator } from './Refrigerator';
import { Sink } from './Sink';
import { Guitar } from './Guitar';
import { Door } from './Door';
import { FrontDoor } from './FrontDoor';
import { Bed } from './Bed';
import { Lamp } from './Lamp';
import { Oven } from './Oven';
import { Nightstand } from './Nightstand';
import { Wardrobe } from './Wardrobe';
import { Toilet } from './Toilet';
import { Bathtub } from './Bathtub';
import { CuttingBoard } from './CuttingBoard';
import { FryingPan } from './FryingPan';
import { CoffeeMachine } from './CoffeeMachine';
import { KillerShadow, MonsterState } from './KillerShadow';
import { Window } from './Window';
import { ClueObject } from './ClueObject';
import { Broom } from './Broom';
import { FuseBox } from './FuseBox';
import { Router } from './Router';
import { ComputerDesk } from './ComputerDesk';
import { Controls } from '../types';
import * as THREE from 'three';

// Helper for TV Spot
const TvSpot: React.FC<{ onEnter: () => void, onLeave: () => void }> = ({ onEnter, onLeave }) => {
    useFrame((state) => {
        // Check distance on 2D plane (XZ) to ignore player height
        const playerX = state.camera.position.x;
        const playerZ = state.camera.position.z;
        const spotX = 2.5;
        const spotZ = 5;
        
        const dist = Math.sqrt(Math.pow(playerX - spotX, 2) + Math.pow(playerZ - spotZ, 2));
        
        if (dist < 1.2) { // Increased radius slightly for better UX
            onEnter();
        } else {
            onLeave();
        }
    });

    return (
        <group position={[2.5, 0.05, 5]}>
            <mesh rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial color="yellow" opacity={0.5} transparent side={DoubleSide} />
            </mesh>
            <Billboard position={[0, 1, 0]}>
                <Text fontSize={0.2} color="yellow" outlineWidth={0.02} outlineColor="black">עמוד כאן</Text>
            </Billboard>
        </group>
    );
};

// Helper for Cleanable Blood
const CleanableBlood: React.FC<{ 
    position: [number, number, number], 
    rotation?: [number, number, number],
    texture: THREE.Texture,
    hasBroom: boolean,
    onClean: () => void
}> = ({ position, rotation, texture, hasBroom, onClean }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const ref = useRef<THREE.Mesh>(null);
    const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
    const [lastPress, setLastPress] = useState(false);

    useFrame((state) => {
        if (ref.current && hasBroom) {
            const dist = state.camera.position.distanceTo(ref.current.position);
            const isClose = dist < 2.5;
            setShowPrompt(isClose);

            if (isClose && interactPressed && !lastPress) {
                onClean();
            }
            setLastPress(interactPressed);
        } else {
            setShowPrompt(false);
        }
    });

    return (
        <group>
            <mesh ref={ref} position={position} rotation={rotation} receiveShadow>
                <planeGeometry args={[1.5, 1.5]} />
                <meshBasicMaterial map={texture} transparent opacity={0.8} depthTest={false} />
            </mesh>
            {showPrompt && (
                <Billboard position={[position[0], 1.0, position[2]]}>
                    <Text fontSize={0.25} color="orange" outlineWidth={0.02} outlineColor="black" renderOrder={999} material-depthTest={false}>
                        [E] לנקות דם
                    </Text>
                </Billboard>
            )}
        </group>
    );
};

// Helper for Plunger Pickup
const Plunger: React.FC<{ position: [number, number, number], onPickup: () => void }> = ({ position, onPickup }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const ref = useRef<THREE.Group>(null);
    const interactPressed = useKeyboardControls<keyof Controls>(state => state.interact);
    const [lastPress, setLastPress] = useState(false);

    useFrame((state) => {
        if(ref.current) {
            const dist = state.camera.position.distanceTo(ref.current.position);
            const isClose = dist < 2.0;
            setShowPrompt(isClose);
            if(isClose && interactPressed && !lastPress) onPickup();
            setLastPress(interactPressed);
        }
    });

    return (
        <group ref={ref} position={position}>
            {showPrompt && <Billboard position={[0,1,0]}><Text fontSize={0.2} color="pink" outlineWidth={0.02}>[E] קח פומפה</Text></Billboard>}
            <mesh position={[0,0.4,0]}><cylinderGeometry args={[0.02,0.02,0.8]} /><meshStandardMaterial color="brown" /></mesh>
            <mesh position={[0,0,0]}><sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="pink" /></mesh>
        </group>
    );
};

// --- COMPONENT FOR GLOBAL JUMPSCARE (Attached to Camera) ---
const GlobalJumpscare: React.FC = () => {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            // Lock position directly in front of camera
            groupRef.current.position.copy(camera.position);
            groupRef.current.quaternion.copy(camera.quaternion);
            
            // Move it slightly forward so it's visible (0.4 units)
            groupRef.current.translateZ(-0.4); 
            // Move slightly down
            groupRef.current.translateY(-0.1);
        }
    });

    return (
        <group ref={groupRef}>
            <KillerShadow 
                position={[0,0,0]} 
                forceState={MonsterState.ATTACKING} 
            />
            {/* VITAL: A dedicated light source attached to the monster face so it is seen even if room lights are off */}
            <pointLight position={[0, 0, 0.2]} intensity={5.0} distance={2} color="#ff0000" decay={1} />
        </group>
    );
};

interface HouseProps {
  isHiding: boolean;
  onToggleHide: (val: boolean) => void;
  isResting: boolean;
  onToggleRest: (val: boolean) => void;
  isBedroomDoorOpen: boolean;
  onToggleBedroomDoor: (val: boolean) => void;
  hasFood: boolean;
  setHasFood: (val: boolean) => void;
  setIsFoodCooked: (val: boolean) => void;
  onBath: () => void;
  isClean: boolean;
  hasIngredients: boolean;
  setHasIngredients: (val: boolean) => void;
  setHasSalad: (val: boolean) => void;
  
  hasEggs: boolean; setHasEggs: (val: boolean) => void;
  hasChicken: boolean; setHasChicken: (val: boolean) => void;
  hasMilk: boolean; setHasMilk: (val: boolean) => void;
  hasCoffee: boolean; setHasCoffee: (val: boolean) => void;
  setHasCookedEggs: (val: boolean) => void;
  setHasCookedChicken: (val: boolean) => void;
  setHasCoffeeCup: (val: boolean) => void;
  
  gameMinutes: number;

  highlightFridge?: boolean;
  onFridgeOpen?: () => void;
  highlightGuitar?: boolean;
  onGuitarPlay?: () => void;
  
  isDoorBarricaded?: boolean;
  onBarricade?: () => void;
  
  missionStage?: number;
  onDoorInvestigate?: () => void; 
  onDoorIgnore?: () => void;      
  onShowerDone?: () => void;      
  onSleep?: () => void;           
  onTvScare?: () => void;         
  isTvCrashed?: boolean;          

  // TV Spot Logic
  onEnterTvSpot?: () => void;
  onLeaveTvSpot?: () => void;
  isStandingForTv?: boolean;

  collectedClues: number[];
  onCollectClue: (id: number) => void;

  isBathroomLocked?: boolean;

  // Broom Props
  hasBroom?: boolean;
  onPickUpBroom?: () => void;
  cleanedBloodCount?: number;
  onCleanBlood?: () => void;

  // --- NEW MISSION PROPS ---
  isToiletClogged?: boolean;
  hasPlunger?: boolean;
  onTakePlunger?: () => void;
  onUnclogToilet?: () => void;

  isPowerOff?: boolean;
  onFixPower?: () => void;

  isRouterReset?: boolean;
  onFixRouter?: () => void;

  // Start Missions Callbacks
  onCloseEntryDoor?: () => void;
  onTurnOnLamp?: () => void;
  
  // Morning Missions Callbacks
  onMorningWash?: () => void;

  triggerGlobalJumpscare?: boolean;

  // Computer Event
  onComputerEvent: (type: 'SEARCH' | 'SCARE_DONE' | 'FINALE') => void;
}

export const House: React.FC<HouseProps> = ({ 
  isHiding, onToggleHide, 
  isResting, onToggleRest,
  isBedroomDoorOpen, onToggleBedroomDoor,
  hasFood, setHasFood, setIsFoodCooked,
  onBath, isClean,
  hasIngredients, setHasIngredients, setHasSalad,
  
  hasEggs, setHasEggs,
  hasChicken, setHasChicken,
  hasMilk, setHasMilk,
  hasCoffee, setHasCoffee,
  setHasCookedEggs, setHasCookedChicken,
  setHasCoffeeCup,
  
  gameMinutes,
  highlightFridge, onFridgeOpen,
  highlightGuitar, onGuitarPlay,
  
  isDoorBarricaded = false, onBarricade = () => {},
  
  missionStage = 0,
  onDoorInvestigate = () => {}, onDoorIgnore = () => {},
  onShowerDone = () => {}, onSleep = () => {},
  onTvScare = () => {}, isTvCrashed = false,

  onEnterTvSpot = () => {}, onLeaveTvSpot = () => {}, isStandingForTv = false,

  collectedClues, onCollectClue,
  isBathroomLocked = false,

  hasBroom = false, onPickUpBroom = () => {},
  cleanedBloodCount = 0, onCleanBlood = () => {},

  isToiletClogged = false, hasPlunger = false, onTakePlunger = () => {}, onUnclogToilet = () => {},
  isPowerOff = false, onFixPower = () => {},
  isRouterReset = false, onFixRouter = () => {},

  onCloseEntryDoor = () => {}, onTurnOnLamp = () => {}, onMorningWash = () => {},

  triggerGlobalJumpscare = false,
  onComputerEvent
}) => {
  const woodTexture = useMemo(() => createWoodTexture(), []);
  const wallTexture = useMemo(() => createWallTexture(), []);
  const rugTexture = useMemo(() => createRugTexture(), []);
  const bedroomRugTexture = useMemo(() => createBedroomRugTexture(), []);
  const tileTexture = useMemo(() => createTileTexture(), []);
  const bloodTexture = useMemo(() => createBloodTexture(), []);

  const [isBathroomDoorOpen, setIsBathroomDoorOpen] = useState(false);

  useEffect(() => {
      if (isBathroomLocked) {
          setIsBathroomDoorOpen(false);
      }
  }, [isBathroomLocked]);

  return (
    <group>
      {/* --- GLOBAL JUMPSCARE MONSTER (Mission 10.5) --- */}
      {triggerGlobalJumpscare && (
          <GlobalJumpscare />
      )}

      {/* --- FLOOR (Main House) --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial map={woodTexture} roughness={0.6} metalness={0.05} color="#ffffff" />
      </mesh>

      {/* --- CEILING (Main House) --- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[10, 20]} />
        <meshBasicMaterial color="#111111" side={DoubleSide} />
      </mesh>

      {/* --- WALLS --- */}
      <mesh position={[-5, 2, -5.3]} receiveShadow castShadow><boxGeometry args={[0.2, 4, 9.4]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[-5, 2, 5.3]} receiveShadow castShadow><boxGeometry args={[0.2, 4, 9.4]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[-5, 3.5, 0]} receiveShadow castShadow><boxGeometry args={[0.2, 1, 1.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[5, 2, -4.3]} receiveShadow castShadow><boxGeometry args={[0.2, 4, 11.4]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[5, 2, 6.3]} receiveShadow castShadow><boxGeometry args={[0.2, 4, 7.4]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[5, 3.5, 2]} receiveShadow castShadow><boxGeometry args={[0.2, 1, 1.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[0, 2, -10]} receiveShadow castShadow><boxGeometry args={[10.2, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      
      {/* Front Wall */}
      <mesh position={[-4.1, 2, 10]} receiveShadow castShadow><boxGeometry args={[1.8, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[-2.8, 0.5, 10]} receiveShadow castShadow><boxGeometry args={[1.7, 1, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[-2.8, 3.25, 10]} receiveShadow castShadow><boxGeometry args={[1.7, 1.5, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[-1.3, 2, 10]} receiveShadow castShadow><boxGeometry args={[1.3, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[2.85, 2, 10]} receiveShadow castShadow><boxGeometry args={[4.3, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <mesh position={[0, 3.1, 10]} receiveShadow castShadow><boxGeometry args={[1.4, 1.8, 0.2]} /><meshStandardMaterial map={wallTexture} color="#d0d0d0" roughness={0.9} /></mesh>
      <Window position={[-2.8, 2, 10]} />

      {/* --- BEDROOM --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.5, 0, 2]} receiveShadow><planeGeometry args={[5, 6]} /><meshStandardMaterial map={woodTexture} roughness={0.6} metalness={0.05} color="#eeeeee" /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[7.5, 4, 2]}><planeGeometry args={[5, 6]} /><meshBasicMaterial color="#050505" side={DoubleSide} /></mesh>
      <mesh position={[7.5, 2, -1]} receiveShadow castShadow><boxGeometry args={[5.2, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#c0c0d0" roughness={0.9} /></mesh>
      <mesh position={[7.5, 2, 5]} receiveShadow castShadow><boxGeometry args={[5.2, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#c0c0d0" roughness={0.9} /></mesh>
      <mesh position={[10, 0.75, 2]} receiveShadow castShadow><boxGeometry args={[0.2, 1.5, 6]} /><meshStandardMaterial map={wallTexture} color="#c0c0d0" roughness={0.9} /></mesh>
      <mesh position={[10, 3.25, 2]} receiveShadow castShadow><boxGeometry args={[0.2, 1.5, 6]} /><meshStandardMaterial map={wallTexture} color="#c0c0d0" roughness={0.9} /></mesh>
      <mesh position={[10, 2, -0.25]} receiveShadow castShadow><boxGeometry args={[0.2, 1, 1.5]} /><meshStandardMaterial map={wallTexture} color="#c0c0d0" roughness={0.9} /></mesh>
      <mesh position={[10, 2, 4.25]} receiveShadow castShadow><boxGeometry args={[0.2, 1, 1.5]} /><meshStandardMaterial map={wallTexture} color="#c0c0d0" roughness={0.9} /></mesh>
      <Window position={[10, 2, 2]} rotation={[0, Math.PI/2, 0]} size={[3, 1]} />

       {/* --- BATHROOM --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7.5, 0, 0]} receiveShadow><planeGeometry args={[5, 5]} /><meshStandardMaterial map={tileTexture} roughness={0.2} metalness={0.1} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-7.5, 4, 0]}><planeGeometry args={[5, 5]} /><meshBasicMaterial color="#050505" side={DoubleSide} /></mesh>
      <mesh position={[-10, 2, 0]} receiveShadow castShadow><boxGeometry args={[0.2, 4, 5]} /><meshStandardMaterial map={wallTexture} color="#a0c0c0" roughness={0.5} /></mesh>
      <mesh position={[-7.5, 2, -2.5]} receiveShadow castShadow><boxGeometry args={[5.2, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#a0c0c0" roughness={0.5} /></mesh>
      <mesh position={[-7.5, 2, 2.5]} receiveShadow castShadow><boxGeometry args={[5.2, 4, 0.2]} /><meshStandardMaterial map={wallTexture} color="#a0c0c0" roughness={0.5} /></mesh>
      <pointLight position={[-7.5, 3.5, 0]} distance={6} intensity={0.4} color="#ccffff" />

      {/* --- DOORS --- */}
      <FrontDoor 
        position={[0, 0, 10]} 
        isBarricaded={isDoorBarricaded} 
        onBarricade={onBarricade} 
        missionActive={missionStage === 7 || missionStage === 8 || missionStage === 0.1} 
        onInvestigate={onDoorInvestigate} 
        onIgnore={onDoorIgnore} 
        canInvestigate={missionStage === 8} 
        onClose={onCloseEntryDoor}
      />
      <Door position={[5, 0, 2]} rotation={[0, Math.PI / 2, 0]} isOpen={isBedroomDoorOpen} onToggle={onToggleBedroomDoor} />
      <Door position={[-5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} isOpen={isBathroomDoorOpen} onToggle={setIsBathroomDoorOpen} isLocked={isBathroomLocked} />
      
      {/* --- FURNITURE --- */}
      <Sink position={[0, 0, -9.2]} missionActive={missionStage === 9.1} onWash={onMorningWash} />
      <CuttingBoard position={[0.8, 0.9, -9.1]} rotation={[0, Math.PI/12, 0]} hasIngredients={hasIngredients} setHasIngredients={setHasIngredients} setHasSalad={setHasSalad} />
      <CoffeeMachine position={[-1.5, 0.9, -9.2]} rotation={[0, -Math.PI/6, 0]} hasMilk={hasMilk} hasCoffee={hasCoffee} setHasMilk={setHasMilk} setHasCoffee={setHasCoffee} setHasCoffeeCup={setHasCoffeeCup} />
      <mesh position={[1.5, 0.45, -9.2]} castShadow receiveShadow><boxGeometry args={[1.5, 0.9, 0.8]} /><meshStandardMaterial color="#1a1a1a" roughness={0.8} /></mesh>
      <mesh position={[-1.5, 0.45, -9.2]} castShadow receiveShadow><boxGeometry args={[1.5, 0.9, 0.8]} /><meshStandardMaterial color="#1a1a1a" roughness={0.8} /></mesh>
      <Refrigerator position={[-3.5, 0, -9.5]} rotation={[0, 0, 0]} hasFood={hasFood} setHasFood={setHasFood} setIsFoodCooked={setIsFoodCooked} hasIngredients={hasIngredients} setHasIngredients={setHasIngredients} hasEggs={hasEggs} setHasEggs={setHasEggs} hasChicken={hasChicken} setHasChicken={setHasChicken} hasMilk={hasMilk} setHasMilk={setHasMilk} hasCoffee={hasCoffee} setHasCoffee={setHasCoffee} isHighlighted={highlightFridge} onOpen={onFridgeOpen} />
      <Lamp position={[4.2, 0, -6.0]} />
      <group position={[1.8, 2.3, -9.1]}>
         <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.01, 0.01, 1.7]} /><meshStandardMaterial color="#111" /></mesh>
         <mesh><coneGeometry args={[0.3, 0.2, 32, 1, true]} /><meshStandardMaterial color="#222" side={DoubleSide} /></mesh>
         <mesh position={[0, -0.05, 0]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ffffee" /></mesh>
         <pointLight position={[0, -0.1, 0]} intensity={isPowerOff ? 0 : 2.5} distance={5} color="#ffffee" castShadow />
      </group>
      
      {/* Fuse Box Logic (Mission 10.5) */}
      <FuseBox position={[4.9, 1.5, -9.8]} isPowerOff={isPowerOff} onFix={onFixPower} />

      <Oven position={[3.5, 0, -9.5]} rotation={[0, 0, 0]} hasFood={hasFood} setHasFood={setHasFood} setIsFoodCooked={setIsFoodCooked} />
      <mesh position={[1.8, 0.91, -9.1]} rotation={[-Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.18, 0.02, 32]} /><meshStandardMaterial color="#111" /></mesh>
      <FryingPan position={[1.8, 0.92, -9.1]} rotation={[0, 0.2, 0]} hasEggs={hasEggs} setHasEggs={setHasEggs} hasChicken={hasChicken} setHasChicken={setHasChicken} setHasCookedEggs={setHasCookedEggs} setHasCookedChicken={setHasCookedChicken} />

      {/* --- LIVING ROOM --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]} receiveShadow><planeGeometry args={[6, 7]} /><meshStandardMaterial map={rugTexture} roughness={0.8} /></mesh>
      <Sofa position={[-3, 0, 5]} rotation={[0, Math.PI / 2, 0]} isHiding={isHiding} onToggleHide={onToggleHide} />
      
      {/* TV Logic with Sweet Spot */}
      {missionStage === 10 && (
          <TvSpot onEnter={onEnterTvSpot} onLeave={onLeaveTvSpot} />
      )}
      <Television 
          position={[4, 0.25, 5]} 
          rotation={[0, -Math.PI / 2, 0]} 
          gameMinutes={gameMinutes} 
          missionActive={missionStage === 10}
          onScare={onTvScare}
          isTvCrashed={isTvCrashed}
          canTurnOn={isStandingForTv} // New Prop
      />
      <KillerShadow position={[4.8, 1.5, 5]} rotation={[0, -Math.PI / 2, 0]} />
      
      {/* Computer Setup (Moved to Living Room) */}
      <ComputerDesk 
        position={[4.2, 0, 7.5]} 
        rotation={[0, -Math.PI/2, 0]}
        missionActive={missionStage === 22} 
        onComputerEvent={onComputerEvent}
      />

      {/* --- BLOOD & CLEANING (Mission 19) --- */}
      
      {/* BROOM - Shows up in Mission 19 if not collected */}
      {!hasBroom && (
          <Broom 
            position={[-4, 0, 7]} 
            rotation={[0, 0, 0.2]} 
            isAvailable={missionStage === 19}
            onPickup={onPickUpBroom}
          />
      )}

      {/* Cleanable Blood Spots - Mission 19.5 */}
      {missionStage === 19.5 && cleanedBloodCount < 1 && (
          <CleanableBlood position={[2, 0.04, 5]} rotation={[-Math.PI/2, 0, 0]} texture={bloodTexture} hasBroom={hasBroom} onClean={onCleanBlood} />
      )}
      {missionStage === 19.5 && cleanedBloodCount < 2 && (
          <CleanableBlood position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 2]} texture={bloodTexture} hasBroom={hasBroom} onClean={onCleanBlood} />
      )}
      {missionStage === 19.5 && cleanedBloodCount < 3 && (
          <CleanableBlood position={[-6, 0.04, 0]} rotation={[-Math.PI/2, 0, -0.5]} texture={bloodTexture} hasBroom={hasBroom} onClean={onCleanBlood} />
      )}

      {/* OLD NON-INTERACTIVE BLOOD (Before cleaning mission) */}
      {missionStage >= 8 && missionStage < 19 && (
          <mesh position={[2, 0.03, 5]} rotation={[-Math.PI/2, 0, Math.random()]} receiveShadow>
              <planeGeometry args={[1.5, 1.5]} />
              <meshBasicMaterial map={bloodTexture} transparent opacity={0.8} />
          </mesh>
      )}
      {missionStage >= 13 && missionStage < 19 && (
          <group>
             <mesh position={[7, 0.03, 2]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={bloodTexture} transparent opacity={0.7} /></mesh>
             <mesh position={[3, 0.03, 2]} rotation={[-Math.PI/2, 0, 1]}><planeGeometry args={[1.2, 1.2]} /><meshBasicMaterial map={bloodTexture} transparent opacity={0.6} /></mesh>
             <mesh position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 2]}><planeGeometry args={[1.5, 1.5]} /><meshBasicMaterial map={bloodTexture} transparent opacity={0.8} /></mesh>
             <mesh position={[-3, 0.03, 0]} rotation={[-Math.PI/2, 0, 0.5]}><planeGeometry args={[1.2, 1.2]} /><meshBasicMaterial map={bloodTexture} transparent opacity={0.7} /></mesh>
             <mesh position={[-6, 0.03, 0]} rotation={[-Math.PI/2, 0, -0.5]}><planeGeometry args={[1.5, 1.5]} /><meshBasicMaterial map={bloodTexture} transparent opacity={0.9} /></mesh>
          </group>
      )}

      <Guitar position={[-4.2, 0, 2.5]} rotation={[0, 1.2, 0]} isHighlighted={highlightGuitar} onPlay={onGuitarPlay} />
      <Lamp position={[-4.0, 0, 6.5]} onToggle={onTurnOnLamp} />

      {/* --- BEDROOM --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.5, 0.02, 2]} receiveShadow><planeGeometry args={[3, 4]} /><meshStandardMaterial map={bedroomRugTexture} roughness={0.8} /></mesh>
      <Bed position={[8.5, 0, 2]} rotation={[0, -Math.PI / 2, 0]} isResting={isResting} onToggleRest={onToggleRest} missionActive={missionStage === 9 || missionStage === 12 || missionStage === 20} onSleep={onSleep} />
      <Nightstand position={[9.0, 0, 3.4]} rotation={[0, -Math.PI / 2, 0]} />
      <Wardrobe position={[7.0, 0, 0.3]} rotation={[0, 0, 0]} />
      
      {/* Router (Mission 17.5) */}
      <Router position={[9.0, 0.55, 3.4]} missionActive={missionStage === 17.5} isReset={isRouterReset} onFix={onFixRouter} />
      
      <Lamp position={[9.5, 0, 4]} />

      {/* --- BATHROOM --- */}
      <Toilet position={[-9, 0, -1.5]} rotation={[0, Math.PI/2, 0]} isClogged={isToiletClogged} hasPlunger={hasPlunger} onUnclog={onUnclogToilet} />
      <Bathtub position={[-9, 0, 1.5]} rotation={[0, Math.PI/2, 0]} onInteract={onBath} isClean={isClean} missionActive={missionStage === 8.5} onIgnoreNoise={onShowerDone} />
      {missionStage >= 14 && missionStage < 16 && (<KillerShadow position={[-9, 1.5, 0]} rotation={[0, Math.PI/2, 0]} forceState={MonsterState.ATTACKING} />)}
      
      {/* Plunger (Mission 8.6) */}
      {isToiletClogged && !hasPlunger && (
          <Plunger position={[0, 0, -3]} onPickup={onTakePlunger} />
      )}

      {/* Light Fixtures */}
      <mesh position={[0, 3.9, -5]}><cylinderGeometry args={[0.3, 0.3, 0.1, 16]} /><meshStandardMaterial color="#888" emissive="#aaa" emissiveIntensity={isPowerOff ? 0 : 1} /></mesh>
      <mesh position={[0, 3.9, 5]}><cylinderGeometry args={[0.3, 0.3, 0.1, 16]} /><meshStandardMaterial color="#888" emissive="#aaa" emissiveIntensity={isPowerOff ? 0 : 1} /></mesh>
      <mesh position={[7.5, 3.9, 2]}><cylinderGeometry args={[0.3, 0.3, 0.1, 16]} /><meshStandardMaterial color="#888" emissive="#555" emissiveIntensity={isPowerOff ? 0 : 0.5} /></mesh>
      <pointLight position={[7.5, 3.5, 2]} distance={8} intensity={isPowerOff ? 0 : 0.2} color="#ccffcc" />

      {/* --- CLUES (Mission 11) --- */}
      {missionStage === 11 && (
        <>
            <ClueObject id={1} position={[-3, 0.05, 6.2]} rotation={[0, Math.PI/4, 0]} isCollected={collectedClues.includes(1)} onCollect={onCollectClue} />
            <ClueObject id={2} position={[7, 0.1, 0.3]} rotation={[0, 0, 0]} isCollected={collectedClues.includes(2)} onCollect={onCollectClue} />
            <ClueObject id={3} position={[8.5, 0.05, 2]} rotation={[0, Math.PI/2, 0]} isCollected={collectedClues.includes(3)} onCollect={onCollectClue} />
            <ClueObject id={4} position={[-9, 0.5, 1.5]} rotation={[Math.PI/4, 0, 0]} isCollected={collectedClues.includes(4)} onCollect={onCollectClue} />
        </>
      )}
    </group>
  );
};

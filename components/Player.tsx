
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { playFootstep } from './AudioEngine';
import { RoomType } from '../types';

interface PlayerProps {
  onRoomChange: (room: RoomType) => void;
  onUnlock?: () => void;
  onLock?: () => void;
  isHiding: boolean;
  isResting: boolean;
  isCleaning: boolean;
  isBedroomDoorOpen: boolean;
  isPhoneMode: boolean;
  isWatchingTv?: boolean; 
  isBathroomLocked?: boolean;
}

// Walk settings
const WALK_SPEED = 2.5;
const CROUCH_SPEED = 1.5;
const STEP_DISTANCE = 1.8;
const STANDING_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.8; 
const HIDING_HEIGHT = 0.45;
const RESTING_HEIGHT = 0.9; 

// Positions
const HIDING_POSITION = new THREE.Vector3(-3, HIDING_HEIGHT, 5);
const HIDING_EXIT_POSITION = new THREE.Vector3(-1.2, STANDING_HEIGHT, 5);
const RESTING_POSITION = new THREE.Vector3(9.0, RESTING_HEIGHT, 2.0);
const RESTING_EXIT_POSITION = new THREE.Vector3(7.0, STANDING_HEIGHT, 2.0);

const SOFA_BOUNDS = {
  xMin: -3 - (1.0 / 2) - 0.6, 
  xMax: -3 + (1.0 / 2) + 0.6, 
  zMin: 5 - (2.8 / 2) - 0.6,  
  zMax: 5 + (2.8 / 2) + 0.6   
};

export const Player: React.FC<PlayerProps> = ({ 
  onRoomChange, 
  onUnlock, 
  onLock, 
  isHiding, 
  isResting,
  isCleaning,
  isBedroomDoorOpen,
  isPhoneMode,
  isWatchingTv = false,
  isBathroomLocked = false
}) => {
  const { camera } = useThree();
  const [sub, get] = useKeyboardControls();
  
  // Refs
  const lastStepPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 5));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const isLocked = useRef(false);
  const prevHiding = useRef(isHiding);
  const prevResting = useRef(isResting);
  
  // Set initial position
  useEffect(() => {
    camera.position.set(0, STANDING_HEIGHT, 5);
    camera.rotation.set(0, 0, 0); 
    lastStepPos.current.copy(camera.position);
    velocity.current.set(0, 0, 0);
  }, [camera]);

  // Handle exiting hiding spot
  useEffect(() => {
    if (prevHiding.current && !isHiding) {
        camera.position.copy(HIDING_EXIT_POSITION);
        velocity.current.set(0, 0, 0);
    }
    prevHiding.current = isHiding;
  }, [isHiding, camera]);

  // Handle exiting resting spot
  useEffect(() => {
    if (prevResting.current && !isResting) {
        camera.position.copy(RESTING_EXIT_POSITION);
        velocity.current.set(0, 0, 0);
    }
    prevResting.current = isResting;
  }, [isResting, camera]);

  // Collision Helper: Furniture
  const checkObjectCollision = (x: number, z: number) => {
    // Check Sofa
    if (x > SOFA_BOUNDS.xMin && x < SOFA_BOUNDS.xMax &&
        z > SOFA_BOUNDS.zMin && z < SOFA_BOUNDS.zMax) {
      return true;
    }
    
    // Check Bed
    if (x > 7.6 && x < 9.4 && z > 0.8 && z < 3.2) {
        return true;
    }

    // Check Nightstand
    if (x > 8.7 && x < 9.3 && z > 3.1 && z < 3.7) {
        return true;
    }

    // Check Wardrobe
    if (x > 6.1 && x < 7.9 && z > -0.1 && z < 0.7) {
        return true;
    }

    // Check Toilet
    if (x > -9.4 && x < -8.6 && z > -1.8 && z < -1.2) {
        return true;
    }

    // Check Bathtub
    if (x > -9.5 && x < -8.5 && z > 1.0 && z < 2.0) {
        return true;
    }

    return false;
  };

  const checkWallCollision = (newX: number, newZ: number) => {
    const PLAYER_RADIUS = 0.2; 

    // Helper: Is point inside a rectangle? (with player radius)
    const isInsideWall = (minX: number, maxX: number, minZ: number, maxZ: number) => {
        return (newX > minX - PLAYER_RADIUS && newX < maxX + PLAYER_RADIUS &&
                newZ > minZ - PLAYER_RADIUS && newZ < maxZ + PLAYER_RADIUS);
    };

    // --- 1. PREVENT WALKING INTO SOLID WALLS (THE BUG FIX) ---
    
    // WEST WALL (Shared with Bathroom) - Left of X=-5
    // Wall Segment South of Door
    if (isInsideWall(-5.2, -4.8, 0.6, 10.5)) return false; 
    // Wall Segment North of Door
    if (isInsideWall(-5.2, -4.8, -10.5, -0.6)) return false;

    // EAST WALL (Shared with Bedroom) - Right of X=5
    // Wall Segment North of Door
    if (isInsideWall(4.8, 5.2, -10.5, 1.4)) return false;
    // Wall Segment South of Door
    if (isInsideWall(4.8, 5.2, 2.6, 10.5)) return false;

    // --- 2. DYNAMIC DOORS ---

    // Bathroom Door Gap (X=-5, Z between -0.6 and 0.6)
    if (isInsideWall(-5.2, -4.8, -0.6, 0.6)) {
        if (isBathroomLocked) return false; // Block if locked
        // Allow pass if unlocked
    }

    // Bedroom Door Gap (X=5, Z between 1.4 and 2.6)
    if (isInsideWall(4.8, 5.2, 1.4, 2.6)) {
        if (!isBedroomDoorOpen) return false; // Block if closed
        // Allow pass if open
    }

    // --- 3. OUTER PERIMETER BOUNDS ---
    
    // Check if we are inside a valid room zone
    const inMainHouse = (newX >= -4.8 && newX <= 4.8 && newZ >= -9.8 && newZ <= 9.8);
    const inBathroom = (newX >= -9.8 && newX <= -4.8 && newZ >= -2.4 && newZ <= 2.4);
    const inBedroom = (newX >= 4.8 && newX <= 9.8 && newZ >= -0.8 && newZ <= 4.8);

    // If we are in the "doorway" zones (the gaps in the walls), we are also valid
    const inBathDoor = (newX >= -5.2 && newX <= -4.8 && newZ >= -0.6 && newZ <= 0.6);
    const inBedDoor = (newX >= 4.8 && newX <= 5.2 && newZ >= 1.4 && newZ <= 2.6);

    return (inMainHouse || inBathroom || inBedroom || inBathDoor || inBedDoor);
  };

  useFrame((state, delta) => {
    // Stop movement if unlocked OR if using phone mouse OR if bathing
    if (!isLocked.current && !isPhoneMode) return;
    if (isPhoneMode) return; 
    
    if (isCleaning || isWatchingTv) {
        velocity.current.set(0, 0, 0);
        return;
    }

    const { forward, backward, left, right, crouch } = get();

    // Hiding Logic
    if (isHiding) {
        camera.position.lerp(HIDING_POSITION, 5 * delta);
        velocity.current.set(0, 0, 0);
        return; 
    }

    // Resting Logic
    if (isResting) {
        camera.position.lerp(RESTING_POSITION, 3 * delta);
        velocity.current.set(0, 0, 0);
        return;
    }

    // Height
    const targetHeight = crouch ? CROUCH_HEIGHT : STANDING_HEIGHT;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetHeight, 10 * delta);

    // Direction
    direction.current.set(0, 0, 0);

    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forwardVec.y = 0;
    forwardVec.normalize();

    const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    rightVec.y = 0;
    rightVec.normalize();

    if (forward) direction.current.add(forwardVec);
    if (backward) direction.current.sub(forwardVec);
    if (left) direction.current.sub(rightVec);
    if (right) direction.current.add(rightVec);

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
    }

    // Velocity
    const frameDelta = Math.min(delta, 0.1);
    const currentSpeed = crouch ? CROUCH_SPEED : WALK_SPEED;
    
    velocity.current.copy(direction.current).multiplyScalar(currentSpeed * frameDelta);

    // Proposed Movement
    const nextX = camera.position.x + velocity.current.x;
    const nextZ = camera.position.z + velocity.current.z;

    // Check Collisions
    let canMoveX = false;
    // Check Walls AND Objects for X move
    if (checkWallCollision(nextX, camera.position.z) && !checkObjectCollision(nextX, camera.position.z)) {
        canMoveX = true;
    }

    if (canMoveX) {
      camera.position.x += velocity.current.x;
    }

    let canMoveZ = false;
    // Check Walls AND Objects for Z move
    if (checkWallCollision(camera.position.x, nextZ) && !checkObjectCollision(camera.position.x, nextZ)) {
        canMoveZ = true;
    }

    if (canMoveZ) {
      camera.position.z += velocity.current.z;
    }

    // Audio
    if (direction.current.lengthSq() > 0 && (canMoveX || canMoveZ)) {
      const dist = camera.position.distanceTo(lastStepPos.current);
      if (dist > STEP_DISTANCE) {
        playFootstep();
        lastStepPos.current.copy(camera.position);
      }
    }

    // Room Check
    if (camera.position.x > 4.5) {
        onRoomChange(RoomType.BEDROOM);
    } else if (camera.position.x < -4.5) {
        onRoomChange(RoomType.BATHROOM);
    } else if (camera.position.z > 0) {
      onRoomChange(RoomType.LIVING_ROOM);
    } else {
      onRoomChange(RoomType.KITCHEN);
    }
  });

  return (
    <>
      {!isPhoneMode && (
        <PointerLockControls 
          makeDefault 
          onUnlock={() => {
            isLocked.current = false;
            if (onUnlock) onUnlock();
          }}
          onLock={() => {
            isLocked.current = true;
            if (onLock) onLock();
          }}
          selector="#root"
        />
      )}
    </>
  );
};

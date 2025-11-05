import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useSoulFragments, type Dimension } from "@/lib/stores/useSoulFragments";

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

interface PlayerProps {
  dimension: Dimension;
}

export function Player({ dimension }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const isGroundedRef = useRef(true);
  const canDoubleJumpRef = useRef(false);
  const phaseShiftActiveRef = useRef(false);
  
  const { currentDimension, updatePlayerPosition, playerPositions, collectAbility, activateObject, abilities, interactiveObjects } = useSoulFragments();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const isActive = currentDimension === dimension;
  
  const hasDoubleJump = abilities.find(a => a.id === "ability_1_jump")?.collected || false;
  const hasPhaseShift = abilities.find(a => a.id === "ability_2_phase")?.collected || false;
  const hasTimeSlow = abilities.find(a => a.id === "ability_3_time")?.collected || false;
  
  const getPlayerColor = () => {
    switch (dimension) {
      case 1: return "#ff6b9d";
      case 2: return "#4ecdc4";
      case 3: return "#ffe66d";
    }
  };
  
  useEffect(() => {
    if (meshRef.current) {
      const pos = playerPositions[dimension];
      meshRef.current.position.copy(pos);
    }
  }, [dimension, playerPositions]);
  
  useFrame((_, delta) => {
    if (!meshRef.current || !isActive) return;
    
    const keys = getKeys();
    
    let inGravityZone = false;
    let inTimeZone = false;
    
    interactiveObjects.forEach(obj => {
      if (obj.type === "gravity_zone" && obj.dimension === dimension && obj.isActivated) {
        const distance = meshRef.current!.position.distanceTo(new THREE.Vector3(...obj.position));
        if (distance < 2.5) {
          inGravityZone = true;
        }
      }
      if (obj.type === "time_zone" && obj.dimension === dimension && obj.isActivated) {
        const distance = meshRef.current!.position.distanceTo(new THREE.Vector3(...obj.position));
        if (distance < 2.5) {
          inTimeZone = true;
        }
      }
    });
    
    let timeMultiplier = 1.0;
    if (hasTimeSlow && dimension === 3) timeMultiplier = 0.5;
    if (inTimeZone) timeMultiplier *= 0.3;
    
    const effectiveDelta = delta * timeMultiplier;
    
    const speed = hasPhaseShift && dimension === 2 ? 12 : 8;
    const jumpForce = 6;
    let gravity = 20;
    
    if (inGravityZone) {
      gravity = -5;
    }
    
    const moveX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const moveZ = (keys.back ? 1 : 0) - (keys.forward ? 1 : 0);
    
    velocityRef.current.x = moveX * speed;
    velocityRef.current.z = moveZ * speed;
    
    if (keys.jump && isGroundedRef.current) {
      velocityRef.current.y = jumpForce;
      isGroundedRef.current = false;
      if (hasDoubleJump && dimension === 1) {
        canDoubleJumpRef.current = true;
      }
      console.log(`Dimension ${dimension}: Jump!`);
    } else if (keys.jump && canDoubleJumpRef.current && !isGroundedRef.current) {
      velocityRef.current.y = jumpForce * 0.8;
      canDoubleJumpRef.current = false;
      console.log(`Dimension ${dimension}: Double Jump!`);
    }
    
    velocityRef.current.y -= gravity * effectiveDelta;
    
    meshRef.current.position.x += velocityRef.current.x * effectiveDelta;
    meshRef.current.position.y += velocityRef.current.y * effectiveDelta;
    meshRef.current.position.z += velocityRef.current.z * effectiveDelta;
    
    if (meshRef.current.position.y <= 1) {
      meshRef.current.position.y = 1;
      velocityRef.current.y = 0;
      isGroundedRef.current = true;
      canDoubleJumpRef.current = false;
    }
    
    meshRef.current.position.x = Math.max(-45, Math.min(45, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-45, Math.min(45, meshRef.current.position.z));
    
    updatePlayerPosition(dimension, meshRef.current.position);
    
    abilities.forEach(ability => {
      if (!ability.collected && ability.dimension === dimension) {
        const distance = meshRef.current!.position.distanceTo(
          new THREE.Vector3(...ability.position)
        );
        if (distance < 2) {
          collectAbility(ability.id);
        }
      }
    });
    
    interactiveObjects.forEach(obj => {
      if (!obj.isActivated && obj.dimension === dimension && !obj.affectsDimension) {
        return;
      }
      
      if (!obj.isActivated && obj.dimension === dimension && obj.affectsDimension) {
        const distance = meshRef.current!.position.distanceTo(
          new THREE.Vector3(...obj.position)
        );
        if (distance < 2.5) {
          activateObject(obj.id);
        }
      }
    });
  });
  
  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial
        color={getPlayerColor()}
        emissive={getPlayerColor()}
        emissiveIntensity={isActive ? 0.5 : 0.1}
        transparent={!isActive}
        opacity={isActive ? 1 : 0.3}
      />
    </mesh>
  );
}

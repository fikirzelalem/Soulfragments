import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Ability as AbilityType } from "@/lib/stores/useSoulFragments";
import { Particles } from "./Particles";

interface AbilityProps {
  ability: AbilityType;
  isActiveDimension: boolean;
}

export function Ability({ ability, isActiveDimension }: AbilityProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ability.collected) return;
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = ability.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
    
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });
  
  if (ability.collected) {
    return null;
  }
  
  return (
    <group position={ability.position}>
      {isActiveDimension && <Particles position={ability.position} color={ability.color} count={30} size={0.08} />}
      
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color={ability.color}
          transparent
          opacity={isActiveDimension ? 0.3 : 0.1}
        />
      </mesh>
      
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={ability.color}
          emissive={ability.color}
          emissiveIntensity={isActiveDimension ? 0.8 : 0.2}
          transparent={!isActiveDimension}
          opacity={isActiveDimension ? 1 : 0.3}
        />
      </mesh>
      
      {isActiveDimension && (
        <mesh position={[0, 2, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color={ability.color} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

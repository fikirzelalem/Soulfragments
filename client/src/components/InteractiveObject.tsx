import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InteractiveObject as ObjectType } from "@/lib/stores/useSoulFragments";

interface InteractiveObjectProps {
  object: ObjectType;
  isActiveDimension: boolean;
}

export function InteractiveObject({ object, isActiveDimension }: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const isSwitch = object.type === "switch";
  const isDoor = object.type === "door";
  const isPlatform = object.type === "platform";
  const isGravityZone = object.type === "gravity_zone";
  const isTimeZone = object.type === "time_zone";
  
  useFrame((state) => {
    if (meshRef.current && isSwitch && !object.isActivated) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
    
    if (meshRef.current && (isGravityZone || isTimeZone)) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });
  
  if (isSwitch) {
    return (
      <group position={object.position}>
        <mesh ref={meshRef} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
          <meshStandardMaterial
            color={object.isActivated ? "#00ff00" : "#ff0000"}
            emissive={object.isActivated ? "#00ff00" : "#ff0000"}
            emissiveIntensity={isActiveDimension ? 0.5 : 0.1}
            transparent={!isActiveDimension}
            opacity={isActiveDimension ? 1 : 0.3}
          />
        </mesh>
        
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color={object.isActivated ? "#00ff00" : "#ff0000"}
            emissive={object.isActivated ? "#00ff00" : "#ff0000"}
            emissiveIntensity={isActiveDimension ? 0.8 : 0.2}
            transparent={!isActiveDimension}
            opacity={isActiveDimension ? 1 : 0.3}
          />
        </mesh>
      </group>
    );
  }
  
  if (isDoor) {
    return (
      <mesh
        position={object.position}
        castShadow
        receiveShadow
        visible={!object.isActivated}
      >
        <boxGeometry args={[4, 3, 0.5]} />
        <meshStandardMaterial
          color="#8b4513"
          transparent={!isActiveDimension || object.isActivated}
          opacity={object.isActivated ? 0 : (isActiveDimension ? 1 : 0.3)}
        />
      </mesh>
    );
  }
  
  if (isPlatform) {
    return (
      <mesh
        position={object.position}
        castShadow
        receiveShadow
        visible={object.isActivated}
      >
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial
          color="#666666"
          transparent={!isActiveDimension || !object.isActivated}
          opacity={!object.isActivated ? 0 : (isActiveDimension ? 1 : 0.3)}
        />
      </mesh>
    );
  }
  
  if (isGravityZone) {
    return (
      <mesh ref={meshRef} position={object.position}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial
          color="#9d4edd"
          transparent
          opacity={isActiveDimension ? 0.3 : 0.1}
          emissive="#9d4edd"
          emissiveIntensity={isActiveDimension ? 0.5 : 0.1}
          wireframe
        />
      </mesh>
    );
  }
  
  if (isTimeZone) {
    return (
      <mesh ref={meshRef} position={object.position}>
        <torusGeometry args={[2, 0.5, 16, 32]} />
        <meshStandardMaterial
          color="#ffd60a"
          transparent
          opacity={isActiveDimension ? 0.4 : 0.1}
          emissive="#ffd60a"
          emissiveIntensity={isActiveDimension ? 0.6 : 0.1}
        />
      </mesh>
    );
  }
  
  return null;
}

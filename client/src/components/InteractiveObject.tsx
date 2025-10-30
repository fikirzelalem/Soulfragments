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
  
  const isSwitch = object.id.startsWith("switch");
  const isDoor = object.id.startsWith("door");
  const isPlatform = object.id.startsWith("platform");
  
  useFrame((state) => {
    if (meshRef.current && isSwitch && !object.isActivated) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
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
  
  return null;
}

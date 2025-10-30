import { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import type { Dimension } from "@/lib/stores/useSoulFragments";

interface WorldProps {
  dimension: Dimension;
  isActive: boolean;
}

export function World({ dimension, isActive }: WorldProps) {
  const groundRef = useRef<THREE.Mesh>(null);
  
  const grassTexture = useTexture("/textures/grass.png");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const sandTexture = useTexture("/textures/sand.jpg");
  
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(10, 10);
  
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(10, 10);
  
  const getDimensionConfig = () => {
    switch (dimension) {
      case 1:
        return {
          fogColor: "#ff6b9d",
          lightColor: "#ff9ecf",
          ambientColor: "#ff6b9d",
          groundColor: "#ff4d8a",
          texture: grassTexture,
          opacity: isActive ? 1 : 0.3
        };
      case 2:
        return {
          fogColor: "#4ecdc4",
          lightColor: "#80ffdb",
          ambientColor: "#4ecdc4",
          groundColor: "#3db9b0",
          texture: asphaltTexture,
          opacity: isActive ? 1 : 0.3
        };
      case 3:
        return {
          fogColor: "#ffe66d",
          lightColor: "#fff4a3",
          ambientColor: "#ffe66d",
          groundColor: "#ffd93d",
          texture: sandTexture,
          opacity: isActive ? 1 : 0.3
        };
    }
  };
  
  const config = getDimensionConfig();
  
  return (
    <group>
      <ambientLight intensity={isActive ? 0.4 : 0.1} color={config.ambientColor} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        color={config.lightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      
      <pointLight
        position={[0, 10, 0]}
        intensity={0.5}
        color={config.lightColor}
        distance={30}
      />
      
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          map={config.texture}
          color={config.groundColor}
          transparent={!isActive}
          opacity={config.opacity}
        />
      </mesh>
      
      <mesh position={[15, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, 2]} />
        <meshStandardMaterial
          color={config.groundColor}
          transparent={!isActive}
          opacity={config.opacity}
          emissive={config.lightColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[-15, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, 2]} />
        <meshStandardMaterial
          color={config.groundColor}
          transparent={!isActive}
          opacity={config.opacity}
          emissive={config.lightColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, 2, 15]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, 2]} />
        <meshStandardMaterial
          color={config.groundColor}
          transparent={!isActive}
          opacity={config.opacity}
          emissive={config.lightColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, 2, -15]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, 2]} />
        <meshStandardMaterial
          color={config.groundColor}
          transparent={!isActive}
          opacity={config.opacity}
          emissive={config.lightColor}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

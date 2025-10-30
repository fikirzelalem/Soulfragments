import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSoulFragments } from "@/lib/stores/useSoulFragments";

export function CameraController() {
  const { camera } = useThree();
  const { currentDimension, playerPositions } = useSoulFragments();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log(`Key pressed: ${e.key}`);
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  useFrame(() => {
    const playerPos = playerPositions[currentDimension];
    
    const offset = new THREE.Vector3(0, 8, 12);
    targetPosition.current.copy(playerPos).add(offset);
    
    targetLookAt.current.copy(playerPos).add(new THREE.Vector3(0, 1, 0));
    
    camera.position.lerp(targetPosition.current, 0.1);
    
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(targetLookAt.current, 0.1);
    
    camera.lookAt(currentLookAt);
  });
  
  return null;
}

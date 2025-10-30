import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useSoulFragments } from "@/lib/stores/useSoulFragments";

export function FogController() {
  const { scene } = useThree();
  const { currentDimension } = useSoulFragments();
  
  useEffect(() => {
    const getFogConfig = () => {
      switch (currentDimension) {
        case 1:
          return { color: "#ff6b9d", near: 10, far: 50 };
        case 2:
          return { color: "#4ecdc4", near: 10, far: 50 };
        case 3:
          return { color: "#ffe66d", near: 10, far: 50 };
      }
    };
    
    const config = getFogConfig();
    scene.fog = new THREE.Fog(config.color, config.near, config.far);
    
    return () => {
      scene.fog = null;
    };
  }, [currentDimension, scene]);
  
  return null;
}

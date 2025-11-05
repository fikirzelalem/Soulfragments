import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  position: [number, number, number];
  color: string;
  count?: number;
  size?: number;
}

export function Particles({ position, color, count = 50, size = 0.1 }: ParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
      
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.1
      ));
    }
    
    return [pos, vel];
  }, [position, count]);
  
  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
      
      velocities[i].y -= 0.01;
      
      if (pos[i * 3 + 1] < position[1] - 3) {
        pos[i * 3] = position[0] + (Math.random() - 0.5) * 2;
        pos[i * 3 + 1] = position[1];
        pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
        velocities[i].set(
          (Math.random() - 0.5) * 0.1,
          Math.random() * 0.2,
          (Math.random() - 0.5) * 0.1
        );
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

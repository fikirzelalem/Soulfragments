import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Game } from "./Game";

const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "back", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
];

export function GameCanvas() {
  return (
    <KeyboardControls map={controls}>
      <Canvas
        shadows
        camera={{
          position: [0, 8, 12],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Game />
      </Canvas>
    </KeyboardControls>
  );
}

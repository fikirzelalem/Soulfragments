import { Suspense } from "react";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { World } from "./World";
import { Player } from "./Player";
import { Ability } from "./Ability";
import { InteractiveObject } from "./InteractiveObject";
import { CameraController } from "./CameraController";
import { DimensionSwitcher } from "./DimensionSwitcher";
import { FogController } from "./FogController";
import { useSoulFragments } from "@/lib/stores/useSoulFragments";
import * as THREE from "three";

export function Game() {
  const { currentDimension, abilities, interactiveObjects } = useSoulFragments();
  
  const getBloomIntensity = () => {
    switch (currentDimension) {
      case 1: return 0.5;
      case 2: return 0.7;
      case 3: return 0.9;
    }
  };
  
  const getChromaticAberrationOffset = () => {
    switch (currentDimension) {
      case 1: return new THREE.Vector2(0.001, 0.001);
      case 2: return new THREE.Vector2(0.002, 0.002);
      case 3: return new THREE.Vector2(0.0015, 0.0015);
    }
  };
  
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <FogController />
      
      <Suspense fallback={null}>
        <World dimension={1} isActive={currentDimension === 1} />
        <Player dimension={1} />
        
        <World dimension={2} isActive={currentDimension === 2} />
        <Player dimension={2} />
        
        <World dimension={3} isActive={currentDimension === 3} />
        <Player dimension={3} />
        
        {abilities.map(ability => (
          <Ability
            key={ability.id}
            ability={ability}
            isActiveDimension={currentDimension === ability.dimension}
          />
        ))}
        
        {interactiveObjects.map(object => (
          <InteractiveObject
            key={object.id}
            object={object}
            isActiveDimension={currentDimension === object.dimension}
          />
        ))}
      </Suspense>
      
      <EffectComposer>
        <Bloom
          intensity={getBloomIntensity()}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.ADD}
        />
        <ChromaticAberration
          offset={getChromaticAberrationOffset()}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
      
      <CameraController />
      <DimensionSwitcher />
    </>
  );
}

import { Suspense } from "react";
import { World } from "./World";
import { Player } from "./Player";
import { Ability } from "./Ability";
import { InteractiveObject } from "./InteractiveObject";
import { CameraController } from "./CameraController";
import { DimensionSwitcher } from "./DimensionSwitcher";
import { FogController } from "./FogController";
import { useSoulFragments } from "@/lib/stores/useSoulFragments";

export function Game() {
  const { currentDimension, abilities, interactiveObjects } = useSoulFragments();
  
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
      
      <CameraController />
      <DimensionSwitcher />
    </>
  );
}

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";

export type Dimension = 1 | 2 | 3;

export interface Ability {
  id: string;
  name: string;
  dimension: Dimension;
  collected: boolean;
  position: [number, number, number];
  color: string;
}

export interface InteractiveObject {
  id: string;
  dimension: Dimension;
  position: [number, number, number];
  affectsDimension?: Dimension;
  affectsObjectId?: string;
  isActivated: boolean;
}

interface SoulFragmentsState {
  currentDimension: Dimension;
  playerPositions: Record<Dimension, THREE.Vector3>;
  abilities: Ability[];
  interactiveObjects: InteractiveObject[];
  currentLevel: number;
  gamePhase: "menu" | "playing" | "levelComplete";
  
  setCurrentDimension: (dimension: Dimension) => void;
  updatePlayerPosition: (dimension: Dimension, position: THREE.Vector3) => void;
  collectAbility: (abilityId: string) => void;
  activateObject: (objectId: string) => void;
  nextLevel: () => void;
  startGame: () => void;
  resetGame: () => void;
  getCollectedAbilities: () => Ability[];
  canUnlockLevel: (level: number) => boolean;
}

const initialAbilities: Ability[] = [
  {
    id: "ability_1_jump",
    name: "Double Jump",
    dimension: 1,
    collected: false,
    position: [5, 1, 5],
    color: "#ff6b9d"
  },
  {
    id: "ability_2_phase",
    name: "Phase Shift",
    dimension: 2,
    collected: false,
    position: [-5, 1, 5],
    color: "#4ecdc4"
  },
  {
    id: "ability_3_time",
    name: "Time Slow",
    dimension: 3,
    collected: false,
    position: [0, 1, -5],
    color: "#ffe66d"
  }
];

const initialObjects: InteractiveObject[] = [
  {
    id: "switch_1",
    dimension: 1,
    position: [10, 0.5, 0],
    affectsDimension: 2,
    affectsObjectId: "door_2",
    isActivated: false
  },
  {
    id: "door_2",
    dimension: 2,
    position: [0, 1.5, 10],
    isActivated: false
  },
  {
    id: "switch_2",
    dimension: 2,
    position: [-10, 0.5, 0],
    affectsDimension: 3,
    affectsObjectId: "platform_3",
    isActivated: false
  },
  {
    id: "platform_3",
    dimension: 3,
    position: [5, 0, 5],
    isActivated: false
  }
];

export const useSoulFragments = create<SoulFragmentsState>()(
  subscribeWithSelector((set, get) => ({
    currentDimension: 1,
    playerPositions: {
      1: new THREE.Vector3(0, 1, 0),
      2: new THREE.Vector3(0, 1, 0),
      3: new THREE.Vector3(0, 1, 0)
    },
    abilities: initialAbilities,
    interactiveObjects: initialObjects,
    currentLevel: 1,
    gamePhase: "menu",
    
    setCurrentDimension: (dimension) => {
      console.log(`Switching to dimension ${dimension}`);
      set({ currentDimension: dimension });
    },
    
    updatePlayerPosition: (dimension, position) => {
      set((state) => ({
        playerPositions: {
          ...state.playerPositions,
          [dimension]: position.clone()
        }
      }));
    },
    
    collectAbility: (abilityId) => {
      set((state) => ({
        abilities: state.abilities.map(ability =>
          ability.id === abilityId
            ? { ...ability, collected: true }
            : ability
        )
      }));
      console.log(`Collected ability: ${abilityId}`);
    },
    
    activateObject: (objectId) => {
      const state = get();
      const object = state.interactiveObjects.find(obj => obj.id === objectId);
      
      if (object && !object.isActivated) {
        set((state) => {
          const newObjects = state.interactiveObjects.map(obj => {
            if (obj.id === objectId) {
              return { ...obj, isActivated: true };
            }
            if (object.affectsObjectId && obj.id === object.affectsObjectId) {
              return { ...obj, isActivated: true };
            }
            return obj;
          });
          
          return { interactiveObjects: newObjects };
        });
        
        console.log(`Activated object: ${objectId}, affects: ${object.affectsObjectId}`);
      }
    },
    
    nextLevel: () => {
      set((state) => ({
        currentLevel: state.currentLevel + 1,
        gamePhase: "playing"
      }));
    },
    
    startGame: () => {
      set({ gamePhase: "playing" });
    },
    
    resetGame: () => {
      set({
        currentDimension: 1,
        playerPositions: {
          1: new THREE.Vector3(0, 1, 0),
          2: new THREE.Vector3(0, 1, 0),
          3: new THREE.Vector3(0, 1, 0)
        },
        abilities: initialAbilities,
        interactiveObjects: initialObjects,
        currentLevel: 1,
        gamePhase: "menu"
      });
    },
    
    getCollectedAbilities: () => {
      return get().abilities.filter(ability => ability.collected);
    },
    
    canUnlockLevel: (level) => {
      const collectedCount = get().abilities.filter(a => a.collected).length;
      return collectedCount >= level;
    }
  }))
);

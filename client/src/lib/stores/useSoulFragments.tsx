import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

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
  type?: "switch" | "door" | "platform" | "gravity_zone" | "time_zone";
}

interface SoulFragmentsState {
  currentDimension: Dimension;
  playerPositions: Record<Dimension, THREE.Vector3>;
  abilities: Ability[];
  interactiveObjects: InteractiveObject[];
  currentLevel: number;
  maxLevel: number;
  gamePhase: "menu" | "playing" | "levelComplete";
  combinedAbilities: string[];
  
  setCurrentDimension: (dimension: Dimension) => void;
  updatePlayerPosition: (dimension: Dimension, position: THREE.Vector3) => void;
  collectAbility: (abilityId: string) => void;
  activateObject: (objectId: string) => void;
  nextLevel: () => void;
  startGame: () => void;
  resetGame: () => void;
  getCollectedAbilities: () => Ability[];
  canUnlockLevel: (level: number) => boolean;
  checkAbilityCombinations: () => void;
  hasCombinedAbility: (abilityName: string) => boolean;
  saveProgress: () => void;
  loadProgress: () => void;
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
    isActivated: false,
    type: "switch"
  },
  {
    id: "door_2",
    dimension: 2,
    position: [0, 1.5, 10],
    isActivated: false,
    type: "door"
  },
  {
    id: "switch_2",
    dimension: 2,
    position: [-10, 0.5, 0],
    affectsDimension: 3,
    affectsObjectId: "platform_3",
    isActivated: false,
    type: "switch"
  },
  {
    id: "platform_3",
    dimension: 3,
    position: [5, 0, 5],
    isActivated: false,
    type: "platform"
  },
  {
    id: "gravity_zone_1",
    dimension: 2,
    position: [-8, 2, 8],
    isActivated: true,
    type: "gravity_zone"
  },
  {
    id: "time_zone_1",
    dimension: 3,
    position: [8, 2, -8],
    isActivated: true,
    type: "time_zone"
  }
];

export const useSoulFragments = create<SoulFragmentsState>()(
  subscribeWithSelector((set, get) => {
    const savedProgress = getLocalStorage("soulFragmentsProgress");
    
    return {
      currentDimension: savedProgress?.currentDimension || 1,
      playerPositions: {
        1: new THREE.Vector3(0, 1, 0),
        2: new THREE.Vector3(0, 1, 0),
        3: new THREE.Vector3(0, 1, 0)
      },
      abilities: savedProgress?.abilities || initialAbilities,
      interactiveObjects: savedProgress?.interactiveObjects || initialObjects,
      currentLevel: savedProgress?.currentLevel || 1,
      maxLevel: 3,
      gamePhase: "menu",
      combinedAbilities: savedProgress?.combinedAbilities || [],
    
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
      
      get().checkAbilityCombinations();
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
    },
    
    checkAbilityCombinations: () => {
      const state = get();
      const collected = state.abilities.filter(a => a.collected).map(a => a.id);
      const newCombined: string[] = [];
      
      if (collected.includes("ability_1_jump") && collected.includes("ability_2_phase")) {
        newCombined.push("phase_jump");
        console.log("Unlocked combined ability: Phase Jump!");
      }
      
      if (collected.includes("ability_2_phase") && collected.includes("ability_3_time")) {
        newCombined.push("time_phase");
        console.log("Unlocked combined ability: Time Phase!");
      }
      
      if (collected.includes("ability_1_jump") && collected.includes("ability_3_time")) {
        newCombined.push("time_jump");
        console.log("Unlocked combined ability: Time Jump!");
      }
      
      if (collected.length === 3) {
        newCombined.push("ultimate_soul");
        console.log("Unlocked ultimate ability: Soul Mastery!");
      }
      
      set({ combinedAbilities: newCombined });
    },
    
    hasCombinedAbility: (abilityName) => {
      return get().combinedAbilities.includes(abilityName);
    },
    
    saveProgress: () => {
      const state = get();
      const progress = {
        currentDimension: state.currentDimension,
        currentLevel: state.currentLevel,
        abilities: state.abilities,
        interactiveObjects: state.interactiveObjects,
        combinedAbilities: state.combinedAbilities
      };
      setLocalStorage("soulFragmentsProgress", progress);
      console.log("Progress saved!");
    },
    
    loadProgress: () => {
      const savedProgress = getLocalStorage("soulFragmentsProgress");
      if (savedProgress) {
        set({
          currentDimension: savedProgress.currentDimension,
          currentLevel: savedProgress.currentLevel,
          abilities: savedProgress.abilities,
          interactiveObjects: savedProgress.interactiveObjects,
          combinedAbilities: savedProgress.combinedAbilities
        });
        console.log("Progress loaded!");
      }
    }
  }})
);

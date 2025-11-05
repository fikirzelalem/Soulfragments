import { useEffect, useRef } from "react";
import { useSoulFragments } from "@/lib/stores/useSoulFragments";
import { useAudio } from "@/lib/stores/useAudio";

export function SoundManager() {
  const { currentDimension, abilities } = useSoulFragments();
  const { isMuted, playSuccess } = useAudio();
  const previousDimensionRef = useRef(currentDimension);
  const previousAbilitiesRef = useRef(abilities);
  
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    if (!isMuted) {
      bgMusic.play().catch(() => {});
    }
    
    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, [isMuted]);
  
  useEffect(() => {
    if (previousDimensionRef.current !== currentDimension) {
      if (!isMuted) {
        const switchSound = new Audio("/sounds/hit.mp3");
        switchSound.volume = 0.2;
        switchSound.play().catch(() => {});
      }
      previousDimensionRef.current = currentDimension;
    }
  }, [currentDimension, isMuted]);
  
  useEffect(() => {
    const newlyCollected = abilities.filter((ability, index) => {
      const previous = previousAbilitiesRef.current[index];
      return ability.collected && (!previous || !previous.collected);
    });
    
    if (newlyCollected.length > 0) {
      playSuccess();
    }
    
    previousAbilitiesRef.current = abilities;
  }, [abilities, playSuccess]);
  
  return null;
}

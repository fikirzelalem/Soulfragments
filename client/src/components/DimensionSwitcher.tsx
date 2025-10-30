import { useEffect } from "react";
import { useSoulFragments, type Dimension } from "@/lib/stores/useSoulFragments";

export function DimensionSwitcher() {
  const { setCurrentDimension } = useSoulFragments();
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') {
        console.log('Switching to Dimension 1 (Pink - Reality)');
        setCurrentDimension(1 as Dimension);
      } else if (e.key === '2') {
        console.log('Switching to Dimension 2 (Cyan - Dream)');
        setCurrentDimension(2 as Dimension);
      } else if (e.key === '3') {
        console.log('Switching to Dimension 3 (Yellow - Memory)');
        setCurrentDimension(3 as Dimension);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setCurrentDimension]);
  
  return null;
}

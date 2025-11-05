import { useSoulFragments } from "@/lib/stores/useSoulFragments";

import { useEffect } from "react";

export function GameUI() {
  const { currentDimension, abilities, currentLevel, gamePhase, startGame, combinedAbilities, maxLevel, saveProgress, loadProgress, resetGame } = useSoulFragments();
  
  const collectedAbilities = abilities.filter(a => a.collected);
  
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (gamePhase === "playing") {
        saveProgress();
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [gamePhase, saveProgress]);
  
  const getDimensionName = () => {
    switch (currentDimension) {
      case 1: return "Reality";
      case 2: return "Dream";
      case 3: return "Memory";
    }
  };
  
  const getDimensionColor = () => {
    switch (currentDimension) {
      case 1: return "#ff6b9d";
      case 2: return "#4ecdc4";
      case 3: return "#ffe66d";
    }
  };
  
  if (gamePhase === "menu") {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black bg-opacity-80 p-8 rounded-lg text-white text-center pointer-events-auto">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent">
            Soul Fragments
          </h1>
          <p className="text-xl mb-6">A Multi-Dimensional Puzzle Adventure</p>
          <div className="mb-6 text-left space-y-2">
            <p className="text-sm"><span className="font-bold">WASD / Arrow Keys:</span> Move</p>
            <p className="text-sm"><span className="font-bold">Space:</span> Jump</p>
            <p className="text-sm"><span className="font-bold">1, 2, 3:</span> Switch Dimensions</p>
          </div>
          <p className="text-sm mb-6 text-gray-300">
            Collect abilities from each dimension to unlock new levels.
            <br />
            Actions in one world affect the others!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                loadProgress();
                startGame();
              }}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors"
            >
              Load Game
            </button>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg text-white">
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Current Dimension</div>
          <div
            className="text-2xl font-bold"
            style={{ color: getDimensionColor() }}
          >
            {currentDimension}: {getDimensionName()}
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mb-2">Level {currentLevel}</div>
        
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Collected Abilities</div>
          <div className="space-y-1">
            {abilities.map(ability => (
              <div
                key={ability.id}
                className={`text-sm ${ability.collected ? 'opacity-100' : 'opacity-30'}`}
                style={{ color: ability.color }}
              >
                {ability.collected ? '✓' : '○'} {ability.name}
              </div>
            ))}
          </div>
        </div>
        
        {combinedAbilities.length > 0 && (
          <div className="mb-3 border-t border-gray-600 pt-2">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Combined Powers</div>
            <div className="space-y-1">
              {combinedAbilities.map(combo => (
                <div
                  key={combo}
                  className="text-sm text-yellow-300 font-bold"
                >
                  ⚡ {combo.replace(/_/g, ' ').toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-400 border-t border-gray-600 pt-2 mt-2">
          <div>Press 1, 2, 3 to switch dimensions</div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg text-white max-w-xs">
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Objective</div>
        <div className="text-sm">
          Collect abilities from all three dimensions.
          <br />
          Activate switches to open paths in other worlds!
        </div>
      </div>
      
      {collectedAbilities.length === abilities.length && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500 p-4 rounded-lg text-white text-center">
          <div className="text-2xl font-bold">Level {currentLevel} Complete!</div>
          <div className="text-sm">
            {currentLevel < maxLevel ? 'All abilities collected! Ready for next level?' : 'You have mastered all dimensions!'}
          </div>
          {combinedAbilities.includes("ultimate_soul") && (
            <div className="text-lg mt-2 font-bold">✨ ULTIMATE SOUL MASTERY UNLOCKED ✨</div>
          )}
        </div>
      )}
    </div>
  );
}

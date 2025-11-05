import { useState, useEffect } from "react";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

export function Tutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const hasSeenTutorial = getLocalStorage("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);
  
  const tutorialSteps = [
    {
      title: "Welcome to Soul Fragments",
      content: "You control fragments of one soul trapped across three parallel dimensions. Switch between them to solve puzzles!"
    },
    {
      title: "Switching Dimensions",
      content: "Press 1, 2, or 3 to switch between Reality (Pink), Dream (Cyan), and Memory (Yellow) dimensions."
    },
    {
      title: "Movement & Abilities",
      content: "Use WASD or Arrow Keys to move, Space to jump. Collect glowing abilities to gain new powers in each dimension!"
    },
    {
      title: "Cross-Dimensional Puzzles",
      content: "Actions in one dimension affect the others! Activate switches to open doors and create platforms in parallel worlds."
    },
    {
      title: "Combined Powers",
      content: "Collect multiple abilities to unlock powerful combined abilities. Experiment with different combinations!"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLocalStorage("hasSeenTutorial", true);
      setShowTutorial(false);
    }
  };
  
  const handleSkip = () => {
    setLocalStorage("hasSeenTutorial", true);
    setShowTutorial(false);
  };
  
  if (!showTutorial) return null;
  
  const step = tutorialSteps[currentStep];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-auto">
      <div className="bg-gray-900 border-2 border-cyan-400 rounded-lg p-8 max-w-md mx-4">
        <div className="mb-4">
          <div className="text-xs text-cyan-400 mb-2">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
          <p className="text-gray-300">{step.content}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white px-4 py-2 rounded transition-colors"
          >
            Skip Tutorial
          </button>
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500 text-white px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity"
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Start Playing'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Clapperboard, Sparkles, Wand2, Loader2, Play } from 'lucide-react';
import { Persona } from '../types';

interface ControlsProps {
  persona: Persona | null;
  scenarioInput: string;
  setScenarioInput: (val: string) => void;
  onGenerate: (isAuto: boolean) => void;
  appState: string;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  persona, 
  scenarioInput, 
  setScenarioInput, 
  onGenerate, 
  appState, 
  disabled 
}) => {
  
  const isProcessing = appState === 'PLANNING' || appState === 'GENERATING';

  const getStatusText = () => {
    if (appState === 'PLANNING') return "Writing Storyboard...";
    if (appState === 'GENERATING') return "Filming 8 Scenes...";
    return "Processing...";
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Clapperboard className="text-purple-500" size={24} />
        <h2 className="text-xl font-bold text-white">Story Director</h2>
      </div>

      <div className="space-y-6">
        
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <Wand2 size={14} /> 
            Scenario Prompt (Optional)
          </label>
          <textarea
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            placeholder={`e.g. ${persona ? persona.nickname : 'She'} goes on a luxury ski trip in the Alps, ending with hot cocoa by the fire.`}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-zinc-600 min-h-[100px] resize-none"
            disabled={disabled || isProcessing}
          />
          <p className="text-xs text-zinc-500">
            Leave empty to let the AI invent a day based on the persona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto Button */}
          <button
            onClick={() => onGenerate(true)}
            disabled={disabled || isProcessing}
            className={`
              relative overflow-hidden group py-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all border border-zinc-700
              ${disabled || isProcessing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-white hover:border-zinc-600'}
            `}
          >
            <Sparkles size={16} className={isProcessing ? "" : "text-yellow-500"} />
            {isProcessing && scenarioInput.length === 0 ? "Working..." : "Auto-Generate Story"}
          </button>

          {/* Custom Scenario Button */}
          <button
            onClick={() => onGenerate(false)}
            disabled={disabled || isProcessing || !scenarioInput.trim()}
            className={`
              py-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all
              ${disabled || isProcessing || !scenarioInput.trim()
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-[1.01] hover:shadow-purple-500/20'}
            `}
          >
             {isProcessing && scenarioInput.length > 0 ? (
               <>
                 <Loader2 size={18} className="animate-spin" />
                 {getStatusText()}
               </>
             ) : (
               <>
                 <Play size={18} fill="currentColor" />
                 Action! (Generate 8 Frames)
               </>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
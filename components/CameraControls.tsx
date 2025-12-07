import React from 'react';
import { Camera, RefreshCw, Aperture, Maximize, MoveVertical, RotateCw } from 'lucide-react';
import { CameraSettings } from '../types';

interface CameraControlsProps {
  settings: CameraSettings;
  setSettings: React.Dispatch<React.SetStateAction<CameraSettings>>;
  onGenerate: () => void;
  isGenerating: boolean;
  onReset: () => void;
  disabled: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({ 
  settings, 
  setSettings, 
  onGenerate, 
  isGenerating, 
  onReset,
  disabled 
}) => {

  const handleChange = (key: keyof CameraSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <Camera className="text-orange-500" size={24} />
           <h2 className="text-xl font-bold text-white">Camera Controls</h2>
        </div>
        <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
           Studio Mode
        </div>
      </div>

      <div className="space-y-8 bg-zinc-950/50 p-6 rounded-xl border border-zinc-800">
        
        {/* Rotation Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-zinc-400">
             <span className="flex items-center gap-1"><RotateCw size={12}/> Rotate View</span>
             <span className="font-mono text-white">{settings.rotation}°</span>
          </div>
          <div className="relative flex items-center gap-3">
            <span className="text-xs text-zinc-600 font-bold w-8">-90°</span>
            <input 
              type="range" 
              min="-90" 
              max="90" 
              step="5"
              value={settings.rotation}
              onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
            />
            <span className="text-xs text-zinc-600 font-bold w-8 text-right">90°</span>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-bold tracking-wider px-10">
             <span>Left Profile</span>
             <span>Front</span>
             <span>Right Profile</span>
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-zinc-400">
             <span className="flex items-center gap-1"><Maximize size={12}/> Zoom Level</span>
             <span className="font-mono text-white">{settings.zoom}/10</span>
          </div>
          <div className="relative flex items-center gap-3">
            <span className="text-xs text-zinc-600 font-bold w-8">0</span>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="1"
              value={settings.zoom}
              onChange={(e) => handleChange('zoom', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
            />
            <span className="text-xs text-zinc-600 font-bold w-8 text-right">10</span>
          </div>
           <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-bold tracking-wider px-10">
             <span>Full Body</span>
             <span>Medium</span>
             <span>Close-Up</span>
          </div>
        </div>

        {/* Vertical Angle Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-zinc-400">
             <span className="flex items-center gap-1"><MoveVertical size={12}/> Vertical Angle</span>
             <span className="font-mono text-white">{settings.vertical}</span>
          </div>
          <div className="relative flex items-center gap-3">
            <span className="text-xs text-zinc-600 font-bold w-8">-1</span>
            <input 
              type="range" 
              min="-1" 
              max="1" 
              step="0.1"
              value={settings.vertical}
              onChange={(e) => handleChange('vertical', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
            />
            <span className="text-xs text-zinc-600 font-bold w-8 text-right">1</span>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-bold tracking-wider px-10">
             <span>Worm's Eye</span>
             <span>Eye Level</span>
             <span>Bird's Eye</span>
          </div>
        </div>

        {/* Wide Angle Checkbox */}
        <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
           <input 
             type="checkbox" 
             id="wideAngle"
             checked={settings.isWideAngle}
             onChange={(e) => handleChange('isWideAngle', e.target.checked)}
             disabled={disabled}
             className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-zinc-900"
           />
           <label htmlFor="wideAngle" className="text-sm font-medium text-zinc-300 flex items-center gap-2 cursor-pointer select-none">
              <Aperture size={16} />
              Wide-Angle Lens Effect (Fisheye/Distortion)
           </label>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <button
          onClick={onReset}
          disabled={disabled || isGenerating}
          className="col-span-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw size={18} />
          Reset
        </button>
        <button
          onClick={onGenerate}
          disabled={disabled || isGenerating}
          className={`
            col-span-2 font-bold py-4 rounded-xl text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${disabled || isGenerating
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 text-black hover:scale-[1.01] hover:shadow-orange-500/20'}
          `}
        >
          {isGenerating ? 'Developing...' : 'Generate Studio Shot'}
        </button>
      </div>
    </div>
  );
};

export default CameraControls;
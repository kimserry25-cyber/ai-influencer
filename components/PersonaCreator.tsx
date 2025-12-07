import React, { useState } from 'react';
import { UserPlus, Wand2, Shuffle, Plus } from 'lucide-react';
import { CreatorAttributes } from '../types';

interface PersonaCreatorProps {
  onCreate: (attrs: CreatorAttributes) => void;
  isGenerating: boolean;
}

const PersonaCreator: React.FC<PersonaCreatorProps> = ({ onCreate, isGenerating }) => {
  const [attributes, setAttributes] = useState<CreatorAttributes>({
    gender: 'Woman',
    age: 24,
    height: 168,
    weight: 52,
    build: 'Slender',
    ethnicity: 'Korean',
    eyeColor: 'Dark Brown',
    hairStyle: 'Long Straight',
    hairColor: 'Black',
    fashionStyle: 'Minimalist Chic',
    vibe: 'Confident'
  });

  const handleChange = (key: keyof CreatorAttributes, value: any) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  const options = {
    build: ['Slender', 'Athletic', 'Curvy', 'Muscular', 'Petite', 'Average', 'Plus-size'],
    ethnicity: ['Korean', 'Japanese', 'Chinese', 'American', 'French', 'Brazilian', 'Indian', 'Russian', 'Mixed'],
    eyeColor: ['Dark Brown', 'Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber'],
    hairStyle: ['Long Straight', 'Long Wavy', 'Bob Cut', 'Pixie', 'Ponytail', 'Bun', 'Braids', 'Short Textured'],
    hairColor: ['Black', 'Dark Brown', 'Brown', 'Blonde', 'Red', 'Auburn', 'Silver', 'Pastel Pink'],
    fashionStyle: ['Minimalist Chic', 'Streetwear', 'Luxury/High-End', 'Vintage', 'Casual', 'Sporty', 'Bohemian', 'Business'],
    vibe: ['Confident', 'Friendly', 'Mysterious', 'Energetic', 'Elegant', 'Cute', 'Edgy']
  };

  const handleRandomize = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    setAttributes({
      gender: Math.random() > 0.5 ? 'Woman' : 'Man', // Bias towards binary for simpler random generation
      age: randomInt(18, 40),
      height: randomInt(155, 185),
      weight: randomInt(45, 90),
      build: randomItem(options.build),
      ethnicity: randomItem(options.ethnicity),
      eyeColor: randomItem(options.eyeColor),
      hairStyle: randomItem(options.hairStyle),
      hairColor: randomItem(options.hairColor),
      fashionStyle: randomItem(options.fashionStyle),
      vibe: randomItem(options.vibe)
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2.5 rounded-full">
              <UserPlus className="text-purple-400" size={20} />
          </div>
          <div>
              <h2 className="text-lg font-bold text-white">Create Virtual Model</h2>
              <p className="text-zinc-500 text-xs">Customize every detail</p>
          </div>
        </div>
        <button 
          onClick={handleRandomize}
          className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-pink-900/20"
        >
          <Shuffle size={14} /> Random
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Gender */}
        <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Gender</label>
            <div className="grid grid-cols-3 gap-0 bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                {(['Man', 'Woman', 'Non-binary'] as const).map(opt => (
                    <button
                        key={opt}
                        onClick={() => handleChange('gender', opt)}
                        className={`py-2 text-xs font-bold rounded-md transition-all ${attributes.gender === opt ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        {opt === 'Non-binary' ? 'Secrecy' : opt}
                    </button>
                ))}
            </div>
        </div>

        {/* Age Slider */}
        <div className="space-y-3">
           <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-400">Age</span>
              <span className="font-bold text-white">{attributes.age}</span>
           </div>
           <input 
              type="range" 
              min="18" max="65" 
              value={attributes.age} 
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500"
           />
        </div>

        {/* Height Slider */}
        <div className="space-y-3">
           <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-400">Height</span>
              <span className="font-bold text-white">
                {attributes.height} <span className="text-zinc-600 text-[10px] font-normal">cm</span>
                <span className="text-zinc-600 mx-2">|</span>
                {Math.floor(attributes.height / 30.48)}' {Math.round((attributes.height % 30.48) / 2.54)}"
              </span>
           </div>
           <input 
              type="range" 
              min="140" max="210" 
              value={attributes.height} 
              onChange={(e) => handleChange('height', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500"
           />
        </div>

        {/* Weight Slider */}
        <div className="space-y-3">
           <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-400">Weight</span>
              <span className="font-bold text-white">
                {attributes.weight} <span className="text-zinc-600 text-[10px] font-normal">kg</span>
                <span className="text-zinc-600 mx-2">|</span>
                {Math.round(attributes.weight * 2.20462)} <span className="text-zinc-600 text-[10px] font-normal">lbs</span>
              </span>
           </div>
           <input 
              type="range" 
              min="40" max="150" 
              value={attributes.weight} 
              onChange={(e) => handleChange('weight', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500"
           />
        </div>

        {/* Dropdowns Grid */}
        <div className="grid grid-cols-1 gap-4 pt-2">
            
            <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Build</label>
                <select 
                    value={attributes.build}
                    onChange={(e) => handleChange('build', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                >
                    {options.build.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Country / Ethnicity</label>
                <div className="relative">
                  <select 
                      value={attributes.ethnicity}
                      onChange={(e) => handleChange('ethnicity', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                  >
                      {options.ethnicity.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <Plus size={14} className="absolute right-3 top-3 text-zinc-500 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Eyes</label>
                <select 
                    value={attributes.eyeColor}
                    onChange={(e) => handleChange('eyeColor', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                >
                    {options.eyeColor.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Hair Style</label>
                  <select 
                      value={attributes.hairStyle}
                      onChange={(e) => handleChange('hairStyle', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                  >
                      {options.hairStyle.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Hair Color</label>
                  <select 
                      value={attributes.hairColor}
                      onChange={(e) => handleChange('hairColor', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                  >
                      {options.hairColor.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              </div>
            </div>

            {/* Separator for Influencer specific fields */}
            <div className="border-t border-zinc-800 my-2"></div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                  <label className="text-xs font-semibold text-purple-400">Fashion</label>
                  <select 
                      value={attributes.fashionStyle}
                      onChange={(e) => handleChange('fashionStyle', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                  >
                      {options.fashionStyle.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-semibold text-purple-400">Vibe</label>
                  <select 
                      value={attributes.vibe}
                      onChange={(e) => handleChange('vibe', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                  >
                      {options.vibe.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              </div>
            </div>

        </div>

      </div>

      <button
        onClick={() => onCreate(attributes)}
        disabled={isGenerating}
        className={`
            w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${isGenerating 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:scale-[1.01] hover:shadow-purple-500/25'}
        `}
      >
        <Wand2 size={20} className={isGenerating ? "animate-spin" : ""} />
        {isGenerating ? "Generating Identity..." : "Generate AI Model"}
      </button>

    </div>
  );
};

export default PersonaCreator;
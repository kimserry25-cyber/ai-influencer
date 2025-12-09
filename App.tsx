import React, { useState, useEffect } from 'react';
import { Sparkles, Info, AlertTriangle, Loader2, Camera, Clapperboard, UserPlus, Settings } from 'lucide-react';
import PhotoUploader from './components/PhotoUploader';
import Controls from './components/Controls';
import CameraControls from './components/CameraControls';
import ResultGallery from './components/ResultGallery';
import PersonaCard from './components/PersonaCard';
import PersonaCreator from './components/PersonaCreator';
import SettingsModal from './components/SettingsModal';
import { Persona, StoryBatch, AppState, CameraSettings, CreatorAttributes } from './types';
import { analyzePersona, planStory, generateStoryBatch, generateStudioImage, generateReferenceImage } from './services/geminiService';

type Tab = 'story' | 'studio' | 'maker';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  
  // Story Mode State
  const [stories, setStories] = useState<StoryBatch[]>([]);
  const [scenarioInput, setScenarioInput] = useState("");
  
  // Studio Mode State
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    rotation: 0,
    zoom: 0,
    vertical: 0,
    isWideAngle: false
  });
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const checkApiKey = () => {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    const envKey = process.env.API_KEY;
    // Check if key is present and not an empty string placeholder
    setHasApiKey(!!localKey || (!!envKey && envKey !== '""'));
    // Reset error state when key is checked/saved
    if (!!localKey || (!!envKey && envKey !== '""')) {
      setError(null);
      setIsApiKeyError(false);
    }
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const handleError = (err: any, customMessage: string) => {
    console.error(err);
    const msg = err.message || "Unknown error";
    
    if (msg === "API_KEY_MISSING" || msg === "INVALID_API_KEY") {
      setError("Valid API Key is required to generate content.");
      setIsApiKeyError(true);
      setHasApiKey(false); // Force UI update
    } else {
      setError(customMessage + (msg ? ` (${msg})` : ""));
      setIsApiKeyError(false);
    }
    setAppState(AppState.ERROR);
  };

  // When image uploads, analyze persona immediately
  const handleImageSelect = async (base64: string) => {
    setRefImage(base64);
    setPersona(null); 
    setAppState(AppState.ANALYZING);
    setError(null);
    setIsApiKeyError(false);

    // If in maker mode, switch to story mode to show results
    if (activeTab === 'maker') setActiveTab('story');

    try {
      const generatedPersona = await analyzePersona(base64);
      setPersona(generatedPersona);
      setAppState(AppState.IDLE);
    } catch (err: any) {
      handleError(err, "Could not analyze persona.");
    }
  };

  const handleCreatePersona = async (attrs: CreatorAttributes) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    setIsApiKeyError(false);
    setRefImage(null);
    setPersona(null);

    try {
      // 1. Generate the base image
      const generatedImage = await generateReferenceImage(attrs);
      setRefImage(generatedImage);

      // 2. Analyze the generated image to create the profile text
      const generatedPersona = await analyzePersona(generatedImage);
      setPersona(generatedPersona);
      
      setAppState(AppState.IDLE);
      setActiveTab('story');
    } catch (err: any) {
      handleError(err, "Failed to create persona.");
    }
  };

  const handleGenerateStory = async (isAuto: boolean) => {
    if (!refImage || !persona) return;
    
    setAppState(AppState.PLANNING);
    setError(null);
    setIsApiKeyError(false);

    try {
      const currentScenario = isAuto ? "" : scenarioInput;
      const prompts = await planStory(persona, currentScenario);
      
      setAppState(AppState.GENERATING);
      const generatedImages = await generateStoryBatch(refImage, prompts);
      
      if (generatedImages.length === 0) throw new Error("Failed to generate any images.");

      const newStory: StoryBatch = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        scenario: currentScenario || "AI Lifestyle Series",
        images: generatedImages.map((img, idx) => ({
          id: `${Date.now()}-${idx}`,
          url: img.url,
          prompt: img.prompt
        }))
      };

      setStories(prev => [newStory, ...prev]);
      setAppState(AppState.SUCCESS);
      setTimeout(() => setAppState(AppState.IDLE), 1000);

    } catch (err: any) {
      handleError(err, "Failed to generate story.");
    }
  };

  const handleGenerateStudio = async () => {
    if (!refImage || !persona) return;
    setAppState(AppState.GENERATING);
    setError(null);
    setIsApiKeyError(false);

    try {
      const result = await generateStudioImage(refImage, cameraSettings, persona);
      
      const newBatch: StoryBatch = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        scenario: "Studio Session",
        images: [{
          id: Date.now().toString(),
          url: result.url,
          prompt: result.prompt
        }]
      };

      setStories(prev => [newBatch, ...prev]);
      setAppState(AppState.SUCCESS);
      setTimeout(() => setAppState(AppState.IDLE), 1000);
    } catch (err: any) {
      handleError(err, "Failed to generate studio shot.");
    }
  };

  const resetAll = () => {
    setRefImage(null);
    setPersona(null);
    setStories([]);
    setScenarioInput("");
    setAppState(AppState.IDLE);
    setError(null);
    setIsApiKeyError(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={checkApiKey}
      />

      {/* Navbar - Updated Color to #9B69FF */}
      <nav className="bg-[#9B69FF] sticky top-0 z-50 shadow-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-sm">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Influencer<span className="text-white/90">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/10 backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab('story')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'story' ? 'bg-white text-[#9B69FF] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <Clapperboard size={14} /> Story Mode
              </button>
              <button 
                onClick={() => setActiveTab('studio')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'studio' ? 'bg-white text-[#9B69FF] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <Camera size={14} /> Studio Mode
              </button>
              <button 
                onClick={() => setActiveTab('maker')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'maker' ? 'bg-white text-[#9B69FF] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <UserPlus size={14} /> Maker
              </button>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
              title="Settings"
            >
              <Settings size={20} />
              {!hasApiKey && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white/20"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {!hasApiKey && (
           <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-4">
             <AlertTriangle className="shrink-0" />
             <div className="flex-1">
               <p className="font-bold">Missing API Key</p>
               <p className="text-sm opacity-80">This app requires a valid Gemini API key. Please configure it in Settings.</p>
             </div>
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
             >
                Open Settings
             </button>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Conditional Rendering based on Tab */}
            {activeTab === 'maker' ? (
              <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                 <PersonaCreator 
                    onCreate={handleCreatePersona} 
                    isGenerating={appState === AppState.ANALYZING} 
                 />
              </section>
            ) : (
              // Story or Studio Mode - Existing Flow
              <>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">1. Identity Source</h2>
                  </div>
                  
                  <PhotoUploader 
                    selectedImage={refImage} 
                    onImageSelect={handleImageSelect}
                    onClear={resetAll} 
                  />
                  
                  {appState === AppState.ANALYZING && (
                    <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-purple-400 animate-pulse">
                      <Loader2 className="animate-spin" />
                      <span className="text-sm font-medium">Analyzing visual identity...</span>
                    </div>
                  )}
                </section>

                {/* Persona Display */}
                {persona && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PersonaCard persona={persona} onReset={resetAll} />
                  </div>
                )}

                {/* Controls Area - Switches based on Tab */}
                <div className={!persona ? 'opacity-50 pointer-events-none filter grayscale transition-all' : 'transition-all'}>
                  
                  {activeTab === 'story' ? (
                    <Controls 
                        persona={persona}
                        scenarioInput={scenarioInput}
                        setScenarioInput={setScenarioInput}
                        onGenerate={handleGenerateStory}
                        appState={appState}
                        disabled={!persona || !hasApiKey}
                    />
                  ) : (
                    <CameraControls 
                        settings={cameraSettings}
                        setSettings={setCameraSettings}
                        onGenerate={handleGenerateStudio}
                        isGenerating={appState === AppState.GENERATING}
                        onReset={() => setCameraSettings({ rotation: 0, zoom: 0, vertical: 0, isWideAngle: false })}
                        disabled={!persona || !hasApiKey}
                    />
                  )}
                </div>
              </>
            )}

            {error && (
               <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-400" />
                    <span>{error}</span>
                 </div>
                 {isApiKeyError && (
                   <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="self-end bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                   >
                      Update API Key
                   </button>
                 )}
               </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
             <div className="h-full">
                {stories.length > 0 ? (
                  <ResultGallery stories={stories} />
                ) : (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 blur-xl rounded-full ${activeTab === 'story' ? 'bg-purple-500/20' : activeTab === 'studio' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}></div>
                      {activeTab === 'story' && <Clapperboard size={64} className="relative text-zinc-700" />}
                      {activeTab === 'studio' && <Camera size={64} className="relative text-zinc-700" />}
                      {activeTab === 'maker' && <UserPlus size={64} className="relative text-zinc-700" />}
                    </div>
                    <h3 className="text-xl font-bold text-zinc-500 mb-2">
                       {activeTab === 'story' && "Ready to create stories"}
                       {activeTab === 'studio' && "Studio is empty"}
                       {activeTab === 'maker' && "Design your Model"}
                    </h3>
                    <p className="max-w-xs text-center text-sm mb-6">
                      {activeTab === 'story' && "Generate 8-frame lifestyle stories based on the persona."}
                      {activeTab === 'studio' && "Adjust camera settings to take professional studio shots."}
                      {activeTab === 'maker' && "Use the form on the left to generate a unique AI Influencer identity."}
                    </p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
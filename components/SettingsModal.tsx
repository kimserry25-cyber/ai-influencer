import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback to trigger re-check in App
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      setApiKey(storedKey || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    onSave();
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-500/10 p-2.5 rounded-full">
            <Key className="text-purple-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">API Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your AI Studio API Key"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Your key is stored locally in your browser. 
              Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline inline-flex items-center gap-0.5">Google AI Studio <ExternalLink size={10}/></a>
            </p>
          </div>

          <div className="flex gap-3 mt-6">
             <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl font-medium text-sm text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
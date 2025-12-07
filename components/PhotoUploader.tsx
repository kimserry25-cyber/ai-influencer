import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, RefreshCcw } from 'lucide-react';

interface PhotoUploaderProps {
  onImageSelect: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onImageSelect, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  if (selectedImage) {
    return (
      <div className="relative group rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl transition-all duration-300">
        <img 
          src={selectedImage} 
          alt="Reference Model" 
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
            <p className="text-white font-semibold">Reference Model Loaded</p>
            <button 
              onClick={onClear}
              className="bg-red-500/90 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-transform hover:scale-105"
            >
              <RefreshCcw size={18} />
              Change Model
            </button>
        </div>
        <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
           <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
           Active
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' 
          : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50 bg-zinc-900/30'}
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      
      <div className="bg-zinc-800 p-4 rounded-full mb-4 shadow-xl ring-1 ring-white/10">
        <Upload size={32} className="text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-zinc-200 mb-2">Upload Reference Photo</h3>
      <p className="text-zinc-500 text-sm max-w-xs text-center">
        Drop your model's photo here, or click to browse. 
        <br/><span className="text-zinc-600 text-xs mt-2 block">Supported: JPG, PNG, WEBP</span>
      </p>
    </div>
  );
};

export default PhotoUploader;
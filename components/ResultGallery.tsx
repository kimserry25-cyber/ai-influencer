import React, { useState } from 'react';
import { StoryBatch, GeneratedImage } from '../types';
import { Download, Calendar, Film, CheckCircle2, Circle } from 'lucide-react';

interface ResultGalleryProps {
  stories: StoryBatch[];
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ stories }) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  if (stories.length === 0) return null;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedImages);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedImages(newSet);
  };

  const selectAllInStory = (story: StoryBatch) => {
    const newSet = new Set(selectedImages);
    const allSelected = story.images.every(img => newSet.has(img.id));
    
    story.images.forEach(img => {
      if (allSelected) {
        newSet.delete(img.id);
      } else {
        newSet.add(img.id);
      }
    });
    setSelectedImages(newSet);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async (images: GeneratedImage[], storyPrefix: string) => {
    if (images.length === 0) return;

    // Sequential download to avoid browser blocking
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      downloadFile(img.url, `${storyPrefix}-${i + 1}.png`);
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const getSelectedCountInStory = (story: StoryBatch) => {
    return story.images.filter(img => selectedImages.has(img.id)).length;
  };

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-2xl font-bold text-white mb-8 pl-2 border-l-4 border-purple-500 flex items-center gap-3">
        Generated Stories
        <span className="text-sm font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
          {stories.length} Series
        </span>
      </h2>
      
      <div className="space-y-16">
        {stories.map((story) => {
          const selectedCount = getSelectedCountInStory(story);
          const isAllSelected = selectedCount === story.images.length && story.images.length > 0;

          return (
            <div key={story.id} className="relative">
              {/* Story Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                      <div className="bg-zinc-800 p-2 rounded-full">
                          <Film className="text-purple-400" size={20} />
                      </div>
                      <div>
                          <h3 className="text-white font-semibold text-lg">
                              {story.scenario === "Auto-generated" ? "AI Curated Lifestyle Series" : story.scenario}
                          </h3>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(story.timestamp).toLocaleTimeString()} &bull; {story.images.length} Frames
                          </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectAllInStory(story)}
                      className="px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isAllSelected ? <CheckCircle2 size={14} className="text-purple-400"/> : <Circle size={14} />}
                      {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>

                    {selectedCount > 0 && (
                      <button
                        onClick={() => handleDownload(story.images.filter(img => selectedImages.has(img.id)), `story-${story.id}`)}
                        className="px-3 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download size={14} />
                        Download Selected ({selectedCount})
                      </button>
                    )}
                    
                    <button
                        onClick={() => handleDownload(story.images, `story-${story.id}`)}
                        className="px-3 py-2 text-xs font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download size={14} />
                        Download All
                    </button>
                  </div>
              </div>

              {/* Grid of Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {story.images.map((img, index) => {
                    const isSelected = selectedImages.has(img.id);
                    return (
                      <div 
                        key={img.id} 
                        className={`group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 border-2 ${isSelected ? 'border-purple-500 scale-[0.98]' : 'border-zinc-800 hover:border-zinc-600'}`}
                        onClick={() => toggleSelection(img.id)}
                      >
                          <div className="aspect-[3/4] overflow-hidden cursor-pointer relative">
                              <img 
                                  src={img.url} 
                                  alt={`Frame ${index + 1}`} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              {/* Selection Checkbox Overlay */}
                              <div className={`absolute top-2 right-2 p-1 rounded-full backdrop-blur-md transition-colors ${isSelected ? 'bg-purple-500 text-white' : 'bg-black/40 text-white/50 group-hover:bg-black/60'}`}>
                                <CheckCircle2 size={20} fill={isSelected ? "currentColor" : "none"} />
                              </div>
                          </div>
                          
                          {/* Prompt Overlay on Hover (Click to Select, so keep actions separate) */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                            <span className="text-[10px] font-bold text-purple-400 uppercase mb-1">Frame {index + 1}</span>
                            <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed mb-2">{img.prompt}</p>
                          </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Divider */}
              <div className="mt-16 border-b border-zinc-900"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultGallery;
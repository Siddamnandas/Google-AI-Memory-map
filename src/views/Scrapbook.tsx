

import React, { useState, useMemo, useEffect } from 'react';
import { Memory } from '@/types';
import { SparklesIcon, SearchIcon, TagIcon, ExportIcon, CheckCircleIcon } from '@/components/Icons';
import AudioPlayer from '@/components/AudioPlayer';

interface ScrapbookProps {
  memories: Memory[];
  onGenerateImage: (memoryId: string) => void;
  onGenerateAudio: (memoryId: string) => void;
  onDeleteMemories: (memoryIds: string[]) => void;
  isGenerating: boolean;
}

const Scrapbook: React.FC<ScrapbookProps> = ({ memories, onGenerateImage, onGenerateAudio, onDeleteMemories, isGenerating }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMemories, setSelectedMemories] = useState<Set<string>>(new Set());
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set());
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [generatingState, setGeneratingState] = useState<{ id: string; type: 'image' | 'audio' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoriesToDelete, setMemoriesToDelete] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isGenerating) {
      setGeneratingState(null);
    }
  }, [isGenerating]);
  
  const handleConfirmDelete = () => {
    onDeleteMemories(Array.from(memoriesToDelete));
    setShowDeleteConfirm(false);
    // If we were in select mode and deleted multiple, reset selection
    if (memoriesToDelete.size > 1) {
        setSelectedMemories(new Set());
        setIsSelectMode(false);
    }
    setMemoriesToDelete(new Set());
  };

  const handleGenerateImageClick = (memoryId: string) => {
    setGeneratingState({ id: memoryId, type: 'image' });
    onGenerateImage(memoryId);
  };

  const handleGenerateAudioClick = (memoryId: string) => {
    setGeneratingState({ id: memoryId, type: 'audio' });
    onGenerateAudio(memoryId);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    memories.forEach(m => m.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
        memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const tagMatch = activeTag === null || memory.tags.includes(activeTag);
      return searchMatch && tagMatch;
    });
  }, [memories, searchTerm, activeTag]);

  const handleSelectToggle = (memoryId: string) => {
    const newSelection = new Set(selectedMemories);
    if (newSelection.has(memoryId)) {
      newSelection.delete(memoryId);
    } else {
      newSelection.add(memoryId);
    }
    setSelectedMemories(newSelection);
  };

  const toggleExpand = (memoryId: string) => {
    const newSet = new Set(expandedMemories);
    if (newSet.has(memoryId)) {
      newSet.delete(memoryId);
    } else {
      newSet.add(memoryId);
    }
    setExpandedMemories(newSet);
  };

  const handleExport = () => {
    const memoriesToExport = memories.filter(m => selectedMemories.has(m.id));
    let exportContent = `MemoryKeeper Export\nExported on: ${new Date().toLocaleString()}\n\n`;

    memoriesToExport.forEach(m => {
      exportContent += `----------------------------------------\n`;
      exportContent += `Date: ${new Date(m.timestamp).toLocaleString()}\n`;
      exportContent += `Tags: ${m.tags.join(', ')}\n\n`;
      exportContent += `${m.content}\n\n`;
    });

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memory-keeper-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsSelectMode(false);
    setSelectedMemories(new Set());
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20"> {/* Padding bottom for export bar */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Your Scrapbook</h1>
        <p className="text-gray-600">A collection of your cherished memories.</p>
      </div>

      {/* Search and Filter */}
      {memories.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-lg space-y-4 sticky top-4 z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <TagIcon className="w-5 h-5 text-gray-500" />
            <button onClick={() => setActiveTag(null)} className={`px-3 py-1 text-sm font-semibold rounded-full transition ${activeTag === null ? 'bg-coral-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>All</button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`px-3 py-1 text-sm font-semibold rounded-full transition ${activeTag === tag ? 'bg-coral-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{tag}</button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedMemories(new Set());
            }}
            className={`w-full mt-2 py-2 text-sm font-bold rounded-full ${isSelectMode ? 'bg-coral-200 text-coral-800' : 'bg-gray-200 text-gray-800'}`}
          >
            {isSelectMode ? 'Cancel Selection' : 'Select Memories'}
          </button>
        </div>
      )}

      {filteredMemories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <SparklesIcon className="w-16 h-16 mx-auto text-yellow-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-700">{memories.length === 0 ? 'Your Scrapbook is Empty' : 'No Matching Memories'}</h2>
          <p className="text-gray-500 mt-2">{memories.length === 0 ? 'Go to the Home page to write your first memory!' : 'Try a different search or filter.'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMemories.map((memory) => {
            const isSelected = selectedMemories.has(memory.id);
            const isExpanded = expandedMemories.has(memory.id);
            return (
              <div
                key={memory.id}
                className={`relative bg-white p-6 rounded-2xl shadow-lg transition-all duration-200 ${isSelectMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-coral-400' : ''}`}
                onClick={isSelectMode ? () => handleSelectToggle(memory.id) : undefined}
              >
                {isSelectMode && isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-coral-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-2">{new Date(memory.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-gray-700 italic">
                  "{isExpanded || memory.content.length <= 120 ? memory.content : `${memory.content.substring(0, 120)}...`}"
                </p>

                {isExpanded && (
                  <div className="space-y-3 my-4 animate-fade-in">
                    {memory.image ? (
                      <div className="rounded-lg overflow-hidden border">
                        <img
                          src={memory.image}
                          alt="Generated from memory"
                          className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setModalImage(memory.image!); }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateImageClick(memory.id); }}
                        disabled={isGenerating}
                        className="w-full aspect-[16/9] bg-mint-50 flex flex-col items-center justify-center gap-2 text-base font-semibold text-mint-600 rounded-lg hover:bg-mint-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-wait transition"
                      >
                        {isGenerating && generatingState?.id === memory.id && generatingState?.type === 'image' ? (
                          <>
                            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-mint-500"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                            <span>Generate an Image</span>
                          </>
                        )}
                      </button>
                    )}

                    {memory.audio ? (
                      <div>
                        <AudioPlayer audioSrc={memory.audio} />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateAudioClick(memory.id); }}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-wait transition"
                      >
                        {isGenerating && generatingState?.id === memory.id && generatingState?.type === 'audio' ? (
                          <>
                            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-sky-500"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                           <>
                            <span className="material-symbols-outlined">mic</span>
                            <span>Create an Audio Reading</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {memory.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-coral-100 text-coral-700 text-xs font-semibold rounded-full">{tag}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(memory.id); }}
                            className="text-sm font-semibold text-coral-600 hover:underline"
                        >
                            {isExpanded ? 'Show Less' : (memory.content.length > 120 ? 'Read More' : 'Details')}
                        </button>
                        {!isSelectMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMemoriesToDelete(new Set([memory.id]));
                                    setShowDeleteConfirm(true);
                                }}
                                className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                aria-label="Delete memory"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        )}
                    </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {isSelectMode && selectedMemories.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 z-20">
            <div className="bg-gray-800 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between animate-fade-in-up">
                <p className="font-bold">{selectedMemories.size} Selected</p>
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => {
                            setMemoriesToDelete(selectedMemories);
                            setShowDeleteConfirm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 font-semibold rounded-full hover:bg-red-600"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-coral-500 font-semibold rounded-full hover:bg-coral-600">
                        <ExportIcon className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>
        </div>
      )}

      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setModalImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] p-4 bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modalImage} alt="Enlarged memory" className="rounded-lg object-contain w-full max-h-[calc(90vh-4rem)]" />
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-800 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-gray-200 transition"
              aria-label="Close image view"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                <p className="text-gray-600">
                    Are you sure you want to delete {memoriesToDelete.size} {memoriesToDelete.size > 1 ? 'memories' : 'memory'}? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button onClick={handleConfirmDelete} className="px-6 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Scrapbook;
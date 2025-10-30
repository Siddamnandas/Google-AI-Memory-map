import React, { useState, useRef } from 'react';
import { CameraIcon } from '@/components/Icons';

interface JournalInputModalProps {
  prompt: string;
  onSave: (data: { content: string; tags: string; image?: string }) => void;
  onClose: () => void;
}

const JournalInputModal: React.FC<JournalInputModalProps> = ({ prompt, onSave, onClose }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (content.trim()) {
      onSave({ content, tags, image: image || undefined });
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-800">Today's Memory</h2>
        <p className="text-gray-600 italic">"{prompt}"</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your memory here..."
          className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400"
          autoFocus
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags (comma-separated)..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400"
        />

        {image ? (
          <div className="relative group">
            <img src={image} alt="Memory preview" className="w-full h-auto max-h-48 object-contain rounded-lg border" />
            <button 
              onClick={removeImage} 
              className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove photo"
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button 
              onClick={handleImageUploadClick} 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
            >
              <CameraIcon className="w-6 h-6" />
              Add a Photo
            </button>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-6 py-2 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600 transition disabled:bg-gray-400"
          >
            Save Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalInputModal;
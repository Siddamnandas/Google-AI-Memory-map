import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getDailyPrompt } from '../services/geminiService';
import BloomingFlower from '../components/BloomingFlower';
import JournalInputModal from '../components/JournalInputModal';
import { SparklesIcon, CheckCircleIcon } from '../components/Icons';

interface HomeProps {
  user: User;
  onSaveMemory: (data: { content: string; tags: string; image?: string }) => void;
}

const Home: React.FC<HomeProps> = ({ user, onSaveMemory }) => {
  const [dailyPrompt, setDailyPrompt] = useState('Loading your daily prompt...');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFlowerAnimating, setIsFlowerAnimating] = useState(false);

  useEffect(() => {
    getDailyPrompt().then(prompt => {
      setDailyPrompt(prompt);
      setIsLoadingPrompt(false);
    });
  }, []);

  const handleSave = (data: { content: string; tags: string; image?: string }) => {
    onSaveMemory(data);
    setIsModalOpen(false);

    // Trigger feedback animations
    setShowConfirmation(true);
    setIsFlowerAnimating(true);
    
    setTimeout(() => setShowConfirmation(false), 3000);
    setTimeout(() => setIsFlowerAnimating(false), 600); // Corresponds to animation duration
  };

  return (
    <div className="space-y-6 text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-800">Hello, {user.name}!</h1>
        <p className="text-gray-600">Here's your progress today.</p>
        
        <div className={`flex justify-around items-center bg-white p-6 rounded-2xl shadow-lg transition-transform duration-500 ${isFlowerAnimating ? 'animate-pulse-once' : ''}`}>
            <div>
                <p className="text-4xl font-bold text-mint-500 flex items-center justify-center">
                    {user.streak}
                    {user.streak > 0 && <span className="text-3xl ml-1">🔥</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1">Current Streak</p>
            </div>
            <BloomingFlower score={user.memoryStrength} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2"/>
                <h2 className="text-xl font-bold text-gray-700">Today's Prompt</h2>
            </div>
            {isLoadingPrompt ? (
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : (
                <p className="text-gray-600 italic text-lg">"{dailyPrompt}"</p>
            )}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 w-full max-w-xs mx-auto py-3 px-6 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600 transition"
            >
                Write About This Memory
            </button>
        </div>

        {isModalOpen && (
            <JournalInputModal 
                prompt={dailyPrompt} 
                onSave={handleSave} 
                onClose={() => setIsModalOpen(false)} 
            />
        )}
        
        {/* Confirmation Message Toast */}
        <div 
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 bg-mint-500 text-white rounded-full shadow-lg transition-all duration-300 ${showConfirmation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
            <CheckCircleIcon className="w-6 h-6" />
            <span className="font-bold">Memory Saved!</span>
        </div>
    </div>
  );
};

export default Home;
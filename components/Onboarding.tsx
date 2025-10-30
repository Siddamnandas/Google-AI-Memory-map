import React, { useState } from 'react';
import { User } from '../types';
import { AvatarManIcon, AvatarWomanIcon, PaletteIcon } from './Icons';

interface OnboardingProps {
  onComplete: (user: Omit<User, 'memoryStrength' | 'streak' | 'longestStreak' | 'trialEndDate'>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    age: 65,
    // FIX: Explicitly cast 'avatar' to the correct type ('man' | 'woman') to satisfy the User interface.
    avatar: 'man' as 'man' | 'woman',
    theme: 'nostalgic' as 'nostalgic' | 'fun',
    consent: { prompts: true, images: true, progress: true }
  });

  const handleChange = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleConsentChange = (field: string, value: boolean) => {
    setUserData(prev => ({ ...prev, consent: { ...prev.consent, [field]: value }}));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    onComplete({
      name: userData.name,
      age: userData.age,
      avatar: userData.avatar,
      theme: userData.theme,
      plan: 'free', // All new users start on the free plan
    });
  };
  
  const isNextDisabled = () => {
    if (step === 1 && userData.name.trim().length < 2) return true;
    if (step === 2 && (userData.age < 65 || userData.age > 120)) return true;
    return false;
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Name
        return (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to MemoryKeeper!</h2>
            <p className="text-gray-600 mb-8">What should we call you?</p>
            <input type="text" value={userData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter your name" className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400"/>
          </>
        );
      case 2: // Age
        return (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">How old are you?</h2>
              <p className="text-gray-600 mb-8">MemoryKeeper is designed for users 65 and older.</p>
              <input type="number" value={userData.age} onChange={(e) => handleChange('age', parseInt(e.target.value, 10))} className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400"/>
            </>
          );
      case 3: // Avatar
        return (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Avatar</h2>
              <p className="text-gray-600 mb-8">This will represent you in the app.</p>
              <div className="flex justify-center gap-6">
                <button onClick={() => handleChange('avatar', 'man')} className={`p-4 rounded-full transition-all duration-200 ${userData.avatar === 'man' ? 'bg-coral-500 ring-4 ring-coral-300' : 'bg-gray-200'}`}><AvatarManIcon className="w-20 h-20 text-white"/></button>
                <button onClick={() => handleChange('avatar', 'woman')} className={`p-4 rounded-full transition-all duration-200 ${userData.avatar === 'woman' ? 'bg-coral-500 ring-4 ring-coral-300' : 'bg-gray-200'}`}><AvatarWomanIcon className="w-20 h-20 text-white"/></button>
              </div>
            </>
        );
      case 4: // Theme
        return (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Select a Theme</h2>
              <p className="text-gray-600 mb-8">Choose the look and feel you prefer.</p>
              <div className="space-y-4">
                  <button onClick={() => handleChange('theme', 'nostalgic')} className={`w-full p-4 text-left rounded-xl border-4 ${userData.theme === 'nostalgic' ? 'border-coral-500' : 'border-gray-200'}`}>
                      <h3 className="font-bold">Nostalgic</h3>
                      <p className="text-sm">A warm, classic feel with sepia tones.</p>
                  </button>
                   <button onClick={() => handleChange('theme', 'fun')} className={`w-full p-4 text-left rounded-xl border-4 ${userData.theme === 'fun' ? 'border-coral-500' : 'border-gray-200'}`}>
                      <h3 className="font-bold">Fun</h3>
                      <p className="text-sm">Bright, cheerful colors to lift your spirits.</p>
                  </button>
              </div>
            </>
        );
      case 5: // Consent
        return (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Personalize Your Experience</h2>
              <p className="text-gray-600 mb-6">We use AI to make your journey unique. Your data is private and secure.</p>
              <div className="space-y-4 text-left">
                  <label className="flex items-center p-3 bg-white rounded-lg"><input type="checkbox" checked={userData.consent.prompts} onChange={e => handleConsentChange('prompts', e.target.checked)} className="h-5 w-5 rounded text-coral-500 focus:ring-coral-400"/><span className="ml-3 text-gray-700">Use memories for personalized prompts</span></label>
                  <label className="flex items-center p-3 bg-white rounded-lg"><input type="checkbox" checked={userData.consent.images} onChange={e => handleConsentChange('images', e.target.checked)} className="h-5 w-5 rounded text-coral-500 focus:ring-coral-400"/><span className="ml-3 text-gray-700">Generate images from your stories</span></label>
                  <label className="flex items-center p-3 bg-white rounded-lg"><input type="checkbox" checked={userData.consent.progress} onChange={e => handleConsentChange('progress', e.target.checked)} className="h-5 w-5 rounded text-coral-500 focus:ring-coral-400"/><span className="ml-3 text-gray-700">Track progress for adaptive games</span></label>
              </div>
            </>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-yellow-50 p-6 text-center animate-fade-in-up">
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
            <div className="flex-grow flex flex-col justify-center">
                 {renderStep()}
            </div>
            <div className="flex items-center gap-4">
                {step > 1 && <button onClick={handleBack} className="w-1/3 mt-10 px-6 py-4 bg-gray-300 text-gray-700 text-lg font-bold rounded-xl hover:bg-gray-400 transition">Back</button>}
                {step < 5 && <button onClick={handleNext} disabled={isNextDisabled()} className="flex-grow mt-10 px-6 py-4 bg-coral-500 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-coral-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Next</button>}
                {step === 5 && <button onClick={handleSubmit} className="flex-grow mt-10 px-6 py-4 bg-coral-500 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-coral-600">Let's Begin!</button>}
            </div>
        </div>
    </div>
  );
};

export default Onboarding;

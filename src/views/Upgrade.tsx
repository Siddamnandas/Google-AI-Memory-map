import React from 'react';
import { StarIcon } from '@/components/Icons';

interface UpgradeProps {
    onBack: () => void;
    onStartTrial: () => void;
}

const Upgrade: React.FC<UpgradeProps> = ({ onBack, onStartTrial }) => {
  const premiumFeatures = [
    "Unlimited journal entries every day",
    "Access all premium games like Echo Echo",
    "Priority AI for faster content generation",
    "Advanced family collaboration features",
    "Export your entire scrapbook",
  ];

  return (
    <div className="p-4 max-w-lg mx-auto text-center space-y-6 animate-fade-in-up">
      <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
        <StarIcon className="w-12 h-12 text-yellow-500" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800">Unlock MemoryKeeper Premium</h1>
      <p className="text-lg text-gray-600">
        Enhance your journey with unlimited access to all our features.
      </p>

      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-yellow-400">
        <h2 className="text-2xl font-bold text-gray-800">Premium Plan</h2>
        <p className="text-5xl font-extrabold my-4 text-gray-900">$4.99<span className="text-xl font-medium text-gray-500">/month</span></p>
        <ul className="space-y-3 text-gray-600 text-left mb-8">
            {premiumFeatures.map((feature, index) => (
                 <li key={index} className="flex items-center">
                    <span className="w-5 h-5 flex items-center justify-center bg-green-100 rounded-full mr-2">
                        <span className="text-green-500 text-sm">✔</span>
                    </span>
                    {feature}
                </li>
            ))}
        </ul>
        <button 
            onClick={onStartTrial}
            className="w-full py-4 bg-yellow-500 text-white text-lg font-bold rounded-full shadow-lg hover:bg-yellow-600 transition">
          Start 7-Day Free Trial
        </button>
        <p className="text-xs text-gray-500 mt-2">Cancel anytime. No commitment.</p>
      </div>

      <button onClick={onBack} className="text-gray-600 font-semibold hover:text-gray-800">
        Maybe later
      </button>
    </div>
  );
};

export default Upgrade;
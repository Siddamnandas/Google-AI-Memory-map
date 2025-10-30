import React from 'react';
import { User, View } from '../types';
import { AvatarManIcon, AvatarWomanIcon, StarIcon } from '../components/Icons';

interface ProfileProps {
  user: User;
  onNavigate: (view: View) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-coral-200 flex items-center justify-center mb-4">
          {user.avatar === 'man' ? (
            <AvatarManIcon className="w-24 h-24 text-coral-600" />
          ) : (
            <AvatarWomanIcon className="w-24 h-24 text-coral-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.age} years old</p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-700">Account Status</h3>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${user.plan === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {user.plan === 'premium' ? 'Premium' : 'Free'}
            </span>
          </div>
          {user.plan === 'free' ? (
            <button 
                onClick={() => onNavigate('upgrade')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-full shadow-lg hover:bg-yellow-500 transition">
                <StarIcon className="w-5 h-5" />
                Upgrade to Premium
            </button>
          ) : (
            <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">You have access to all features!</p>
                 {user.trialEndDate && <p className="text-xs text-gray-600">Trial ends {new Date(user.trialEndDate).toLocaleDateString()}</p>}
            </div>
          )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="font-bold text-lg mb-4 text-gray-700 text-left">Your Progress</h3>
        <div className="flex justify-around text-center">
            <div>
                <p className="text-3xl font-bold text-mint-500 flex items-center justify-center">
                    {user.streak}
                    {user.streak > 0 && <span className="text-2xl ml-1">🔥</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1">Current Streak</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-700 flex items-center justify-center">
                    {user.longestStreak}
                    <span className="text-2xl ml-1">⭐</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Longest Streak</p>
            </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-2xl shadow-lg text-left">
          <button 
              onClick={() => onNavigate('scrapbook')}
              className="w-full flex items-center justify-between text-left group p-2"
          >
              <div>
                  <h3 className="font-bold text-lg text-gray-700">Your Scrapbook</h3>
                  <p className="text-sm text-gray-500">View all your saved memories</p>
              </div>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-coral-500 transition-colors">
                  arrow_forward_ios
              </span>
          </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg text-left">
          <h3 className="font-bold text-lg mb-4 text-gray-700">Settings</h3>
          <div className="space-y-3">
              <div className="flex justify-between items-center">
                  <span className="text-gray-600">App Theme</span>
                  <span className="font-semibold text-gray-800 capitalize">{user.theme}</span>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Profile;
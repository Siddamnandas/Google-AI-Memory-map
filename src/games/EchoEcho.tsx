import React from 'react';
import { GameType } from '@/types';

interface EchoEchoProps {
  onComplete: (score: number, gameType: GameType) => void;
}

const EchoEcho: React.FC<EchoEchoProps> = ({ onComplete }) => {
  return (
    <div className="text-center p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-700">Echo Echo</h2>
      <p className="text-gray-600 my-4">This premium game is coming soon!</p>
      <button onClick={() => onComplete(0, GameType.EchoEcho)} className="mt-4 px-6 py-2 bg-coral-500 text-white font-bold rounded-full">
        Back to Lobby
      </button>
    </div>
  );
};

export default EchoEcho;
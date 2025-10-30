import React from 'react';
import { GameType } from '@/types';
import { PuzzleIcon, BookIcon, ClockIcon } from '@/components/Icons';

interface GameLobbyProps {
  onSelectGame: (gameType: GameType) => void;
}

const GameCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full bg-white p-6 rounded-2xl shadow-lg text-left hover:shadow-xl hover:scale-105 transition-transform duration-200">
        <div className="flex items-center mb-2">
            <div className="p-2 bg-coral-100 rounded-full mr-4">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <p className="text-gray-600">{description}</p>
    </button>
);


const GameLobby: React.FC<GameLobbyProps> = ({ onSelectGame }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Memory Games</h1>
        <p className="text-gray-600">Challenge your mind and revisit your stories.</p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <GameCard 
            icon={<PuzzleIcon className="w-8 h-8 text-coral-600"/>}
            title={GameType.MemoryMatchUp}
            description="Match pairs of words and concepts from your memories."
            onClick={() => onSelectGame(GameType.MemoryMatchUp)}
        />
        <GameCard 
            icon={<BookIcon className="w-8 h-8 text-coral-600"/>}
            title={GameType.StoryQuizQuest}
            description="Answer multiple-choice questions about your past stories."
            onClick={() => onSelectGame(GameType.StoryQuizQuest)}
        />
        <GameCard 
            icon={<ClockIcon className="w-8 h-8 text-coral-600"/>}
            title={GameType.TimelineTango}
            description="Arrange events from your memories in the correct order."
            onClick={() => onSelectGame(GameType.TimelineTango)}
        />
        {/* Placeholder for premium games */}
        <div className="w-full bg-gray-100 p-6 rounded-2xl shadow-inner text-center">
            <h2 className="text-xl font-bold text-gray-500">More Games Coming Soon!</h2>
            <p className="text-gray-500">Upgrade to Premium to unlock new challenges.</p>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
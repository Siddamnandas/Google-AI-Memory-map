import React, { useState, useEffect, useMemo } from 'react';
import { Memory, TimelineEvent, GameType, User, GameDifficulty } from '../types';
import { createTimelineEvents } from '../services/geminiService';
import { LightbulbIcon } from '../components/Icons';

interface TimelineTangoProps {
  user: User;
  memories: Memory[];
  onComplete: (score: number, gameType: GameType) => void;
}

const getDifficulty = (memoryStrength: number): GameDifficulty => {
    if (memoryStrength < 40) return 'easy';
    if (memoryStrength < 70) return 'medium';
    return 'hard';
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


const TimelineTango: React.FC<TimelineTangoProps> = ({ user, memories, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [correctOrder, setCorrectOrder] = useState<TimelineEvent[]>([]);
  const [userOrder, setUserOrder] = useState<TimelineEvent[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintedIndex, setHintedIndex] = useState<number | null>(null);

  const difficulty = getDifficulty(user.memoryStrength);
  
  useEffect(() => {
    const generateGame = async () => {
      setIsLoading(true);
      const events = await createTimelineEvents(memories, difficulty);
      if (events && events.length > 0) {
        setCorrectOrder(events);
        setUserOrder(shuffleArray(events));
      }
      setIsLoading(false);
    };

    generateGame();
  }, [memories, difficulty]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= userOrder.length) return;
    const newOrder = [...userOrder];
    const [item] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, item);
    setUserOrder(newOrder);
  };
  
  const handleHint = () => {
      if (hintUsed) return;
      const firstIncorrectIndex = userOrder.findIndex((item, index) => item.id !== correctOrder[index].id);
      if (firstIncorrectIndex !== -1) {
          const itemToMove = userOrder[firstIncorrectIndex];
          const correctIndex = correctOrder.findIndex(item => item.id === itemToMove.id);
          setHintedIndex(correctIndex);
          setHintUsed(true);
          setTimeout(() => setHintedIndex(null), 1500);
      }
  }
  
  const score = useMemo(() => {
    if (!isFinished || correctOrder.length === 0) return 0;
    let correctCount = 0;
    userOrder.forEach((item, index) => {
      if (item.id === correctOrder[index].id) {
        correctCount++;
      }
    });
    return Math.round((correctCount / correctOrder.length) * 100);
  }, [isFinished, userOrder, correctOrder]);

  if (isLoading) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Sorting Your Memories...</h2>
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-coral-500 mx-auto mt-4"></div>
      </div>
    );
  }

  if (correctOrder.length === 0 && !isLoading) {
     return (
       <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Not Enough Memories</h2>
        <p className="text-gray-600 my-4">We need at least 3 memories to create this game. Please go back and add more stories to your scrapbook!</p>
        <button onClick={() => onComplete(0, GameType.TimelineTango)} className="mt-4 px-6 py-2 bg-coral-500 text-white font-bold rounded-full">Back to Lobby</button>
      </div>
    );
  }
  
  if (isFinished) {
      return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-700">Timeline Complete!</h2>
        <p className="text-gray-600 my-4">You placed {Math.round(score / 100 * correctOrder.length)} out of {correctOrder.length} events correctly.</p>
        <p className="text-5xl font-bold text-mint-500 my-4">{score}</p>
        <p className="text-lg text-gray-600">Your Score</p>
        <button onClick={() => onComplete(score, GameType.TimelineTango)} className="mt-6 px-8 py-3 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600">Back to Lobby</button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Timeline Tango</h1>
                <p className="text-gray-600">Arrange the events in chronological order.</p>
            </div>
            <button onClick={handleHint} disabled={hintUsed} className="p-3 bg-yellow-100 text-yellow-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <LightbulbIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2">
            {userOrder.map((event, index) => (
                <div 
                    key={event.id} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${hintedIndex === index ? 'bg-yellow-200 ring-2 ring-yellow-500' : 'bg-gray-50'}`}
                >
                    <p className="text-gray-800 flex-grow">{event.description}</p>
                    <div className="flex flex-col ml-2">
                        <button onClick={() => moveItem(index, index - 1)} disabled={index === 0} className="disabled:opacity-20">▲</button>
                        <button onClick={() => moveItem(index, index + 1)} disabled={index === userOrder.length - 1} className="disabled:opacity-20">▼</button>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={() => setIsFinished(true)} className="w-full mt-6 py-3 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600">
            Check My Order
        </button>
    </div>
  );
};

export default TimelineTango;
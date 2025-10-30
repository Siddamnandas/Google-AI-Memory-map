import React, { useState, useEffect, useMemo } from 'react';
import { Memory, MatchPair, GameType, User, GameDifficulty } from '@/types';
import { createMemoryMatchPairs } from '@/services/geminiService';
import { LightbulbIcon } from '@/components/Icons';

interface MemoryMatchUpProps {
  user: User;
  memories: Memory[];
  onComplete: (score: number, gameType: GameType) => void;
}

type Card = {
  id: string;
  content: string;
  pairId: string;
};

// Durstenfeld shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getDifficulty = (memoryStrength: number): GameDifficulty => {
    if (memoryStrength < 40) return 'easy';
    if (memoryStrength < 70) return 'medium';
    return 'hard';
}

const MemoryMatchUp: React.FC<MemoryMatchUpProps> = ({ user, memories, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [justMatched, setJustMatched] = useState<string | null>(null);

  const difficulty = getDifficulty(user.memoryStrength);

  useEffect(() => {
    const generateGame = async () => {
      setIsLoading(true);
      const generatedPairs = await createMemoryMatchPairs(memories, difficulty);
      if (generatedPairs && generatedPairs.length > 0) {
        setPairs(generatedPairs);
        const gameCards: Card[] = [];
        generatedPairs.forEach(pair => {
          gameCards.push({ id: `${pair.id}-a`, content: pair.word, pairId: pair.id });
          gameCards.push({ id: `${pair.id}-b`, content: pair.match, pairId: pair.id });
        });
        setCards(shuffleArray(gameCards));
      }
      setIsLoading(false);
    };

    generateGame();
  }, [memories, difficulty]);

  const handleCardClick = (index: number) => {
    if (selected.length === 2 || selected.includes(index) || matched.includes(cards[index].pairId)) {
      return;
    }
    setSelected(prev => [...prev, index]);
  };
  
  const handleHint = () => {
      if(hintUsed || selected.length > 0) return;
      
      const unmatchedCards = cards.filter(c => !matched.includes(c.pairId));
      if (unmatchedCards.length < 2) return;
      
      const firstCard = unmatchedCards[0];
      const matchingCard = unmatchedCards.find(c => c.pairId === firstCard.pairId && c.id !== firstCard.id);
      
      if(matchingCard) {
          const firstIndex = cards.findIndex(c => c.id === firstCard.id);
          const secondIndex = cards.findIndex(c => c.id === matchingCard.id);
          setSelected([firstIndex, secondIndex]);
          setHintUsed(true);
          setAttempts(a => a + 3); // Penalty for using hint
          setTimeout(() => setSelected([]), 1500);
      }
  }

  useEffect(() => {
    if (selected.length === 2) {
      setAttempts(prev => prev + 1);
      const [firstIndex, secondIndex] = selected;
      if (cards[firstIndex].pairId === cards[secondIndex].pairId) {
        const pairId = cards[firstIndex].pairId;
        setMatched(prev => [...prev, pairId]);
        setJustMatched(pairId);
        setSelected([]);
        setTimeout(() => setJustMatched(null), 400); // Animation duration
      } else {
        setIsWrong(true);
        setTimeout(() => {
          setSelected([]);
          setIsWrong(false);
        }, 1200);
      }
    }
  }, [selected, cards]);

  useEffect(() => {
    if (pairs.length > 0 && matched.length === pairs.length) {
        setTimeout(() => setGameOver(true), 500);
    }
  }, [matched, pairs]);

  const score = useMemo(() => {
    if (pairs.length === 0) return 0;
    const score = Math.max(0, 100 - (attempts - pairs.length) * 5);
    return score;
  }, [attempts, pairs]);

  if (isLoading) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Building Your Game...</h2>
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-coral-500 mx-auto mt-4"></div>
      </div>
    );
  }

  if (cards.length === 0 && !isLoading) {
    return (
       <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Not Enough Memories</h2>
        <p className="text-gray-600 my-4">We need a few more memories to create this game. Please go back and add more stories to your scrapbook!</p>
        <button onClick={() => onComplete(0, GameType.MemoryMatchUp)} className="mt-4 px-6 py-2 bg-coral-500 text-white font-bold rounded-full">Back to Lobby</button>
      </div>
    );
  }
  
  if (gameOver) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-700">Congratulations!</h2>
        <p className="text-gray-600 my-4">You found all the matches!</p>
        <p className="text-5xl font-bold text-mint-500 my-4 animate-pop">{score}</p>
        <p className="text-lg text-gray-600">Your Score</p>
        <button onClick={() => onComplete(score, GameType.MemoryMatchUp)} className="mt-6 px-8 py-3 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600">Back to Lobby</button>
      </div>
    );
  }
  
  const gridCols = pairs.length <= 4 ? 'grid-cols-2' : (pairs.length <= 6 ? 'grid-cols-3' : 'grid-cols-4');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Memory Match-Up</h1>
          <p className="text-gray-600">Attempts: {attempts}</p>
        </div>
        <button onClick={handleHint} disabled={hintUsed || selected.length > 0} className="p-3 bg-yellow-100 text-yellow-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
            <LightbulbIcon className="w-6 h-6" />
        </button>
      </div>
      <div className={`grid ${gridCols} sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto`}>
        {cards.map((card, index) => {
          const isFlipped = selected.includes(index) || matched.includes(card.pairId);
          const isSelectedAndWrong = isWrong && selected.includes(index);
          const isJustMatched = justMatched === card.pairId;

          return (
            <div key={card.id} className={`aspect-square perspective ${isSelectedAndWrong ? 'animate-shake' : ''}`} onClick={() => handleCardClick(index)}>
              <div className={`relative w-full h-full preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''} ${isJustMatched ? 'animate-pop' : ''}`}>
                {/* Back of card */}
                <div className="absolute w-full h-full backface-hidden bg-coral-500 rounded-lg flex items-center justify-center cursor-pointer shadow-md">
                  <span className="text-white text-4xl font-bold">?</span>
                </div>
                {/* Front of card */}
                <div className="absolute w-full h-full backface-hidden bg-white rounded-lg flex items-center justify-center p-2 text-center rotate-y-180 border-2 border-coral-500">
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{card.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryMatchUp;
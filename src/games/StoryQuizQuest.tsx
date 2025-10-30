import React, { useState, useEffect } from 'react';
import { Memory, QuizQuestion, GameType, User, GameDifficulty } from '@/types';
import { createStoryQuiz } from '@/services/geminiService';
import { LightbulbIcon } from '@/components/Icons';

interface StoryQuizQuestProps {
  user: User;
  memories: Memory[];
  onComplete: (score: number, gameType: GameType) => void;
}

const getDifficulty = (memoryStrength: number): GameDifficulty => {
    if (memoryStrength < 40) return 'easy';
    if (memoryStrength < 70) return 'medium';
    return 'hard';
}

const StoryQuizQuest: React.FC<StoryQuizQuestProps> = ({ user, memories, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  const difficulty = getDifficulty(user.memoryStrength);
  
  useEffect(() => {
    const generateGame = async () => {
      setIsLoading(true);
      const generatedQuestions = await createStoryQuiz(memories, difficulty);
      if (generatedQuestions && generatedQuestions.length > 0) {
          setQuestions(generatedQuestions);
      }
      setIsLoading(false);
    };

    generateGame();
  }, [memories, difficulty]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
      setIsAnswered(false);
      setSelectedOption(null);
      setHintUsed(false);
      setHiddenOptions([]);
      setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const handleHint = () => {
      if(hintUsed || isAnswered) return;
      const currentQuestion = questions[currentQuestionIndex];
      const incorrectOptions = currentQuestion.options.filter(opt => opt !== currentQuestion.correctAnswer);
      if (incorrectOptions.length > 1) {
          setHiddenOptions([incorrectOptions[0]]);
      }
      setHintUsed(true);
  }
  
  const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Writing Your Quiz...</h2>
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-coral-500 mx-auto mt-4"></div>
      </div>
    );
  }

  if (questions.length === 0 && !isLoading) {
    return (
       <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Not Enough Memories</h2>
        <p className="text-gray-600 my-4">We need at least one memory to create this quiz. Please go back and add a story to your scrapbook!</p>
        <button onClick={() => onComplete(0, GameType.StoryQuizQuest)} className="mt-4 px-6 py-2 bg-coral-500 text-white font-bold rounded-full">Back to Lobby</button>
      </div>
    );
  }
  
  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-700">Quiz Complete!</h2>
        <p className="text-gray-600 my-4">You answered {score} out of {questions.length} questions correctly.</p>
        <p className="text-5xl font-bold text-mint-500 my-4 animate-pop">{finalScore}</p>
        <p className="text-lg text-gray-600">Your Score</p>
        <button onClick={() => onComplete(finalScore, GameType.StoryQuizQuest)} className="mt-6 px-8 py-3 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600">Back to Lobby</button>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-4 max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Story Quiz Quest</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <button onClick={handleHint} disabled={hintUsed || isAnswered} className="p-3 bg-yellow-100 text-yellow-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                <LightbulbIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div key={currentQuestionIndex} className="bg-white p-6 rounded-2xl shadow-lg animate-slide-in-from-right">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">{currentQuestion.question}</h2>
            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                    if (hiddenOptions.includes(option)) return null;

                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedOption;
                    let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition ';
                    let animationClass = '';

                    if (isAnswered) {
                        if (isCorrect) {
                            buttonClass += 'bg-green-100 border-green-400 text-green-800';
                            if (isSelected) {
                                animationClass = 'animate-pop';
                            }
                        } else if (isSelected && !isCorrect) {
                            buttonClass += 'bg-red-100 border-red-400 text-red-800';
                            animationClass = 'animate-shake';
                        } else {
                            buttonClass += 'bg-gray-100 border-gray-200 text-gray-600';
                        }
                    } else {
                        buttonClass += 'bg-white border-gray-300 hover:bg-coral-50 hover:border-coral-400';
                    }

                    return (
                        <button key={index} onClick={() => handleOptionClick(option)} disabled={isAnswered} className={`${buttonClass} ${animationClass}`}>
                           {option}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <button onClick={handleNextQuestion} className="w-full mt-6 py-3 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600 animate-fade-in">
                    Next Question
                </button>
            )}
        </div>
    </div>
  );
};

export default StoryQuizQuest;
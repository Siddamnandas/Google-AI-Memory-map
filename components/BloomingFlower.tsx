
import React from 'react';

interface BloomingFlowerProps {
  score: number; // Score from 0 to 100
}

const BloomingFlower: React.FC<BloomingFlowerProps> = ({ score }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const petalsToShow = Math.floor(normalizedScore / 10);
  const rotationStep = 360 / 10;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Center */}
        <circle cx="100" cy="100" r="25" fill="#FFD700" />

        {/* Petals */}
        {Array.from({ length: 10 }).map((_, i) => (
          <ellipse
            key={i}
            cx="100"
            cy="100"
            rx="25"
            ry="50"
            fill="#FF69B4"
            fillOpacity={i < petalsToShow ? 0.8 : 0.2}
            transform={`rotate(${i * rotationStep} 100 100)`}
            className="transition-all duration-700 ease-in-out"
          />
        ))}
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-white drop-shadow-md">{normalizedScore}</div>
        <div className="text-xs font-semibold text-white uppercase tracking-wider drop-shadow-md">Score</div>
      </div>
    </div>
  );
};

export default BloomingFlower;

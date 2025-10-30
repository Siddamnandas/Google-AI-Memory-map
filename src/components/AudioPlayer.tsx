import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon } from '@/components/Icons';

interface AudioPlayerProps {
  audioSrc: string; // base64 encoded audio data URL, e.g., "data:audio/pcm;base64,..."
}

// Helper functions for decoding, as per Gemini API guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is int16, so we create a view on the buffer
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize from -32768 - 32767 to -1.0 to 1.0
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!audioSrc) return;
    
    // Initialize AudioContext
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;
    
    // Extract base64 data from data URL
    const base64Data = audioSrc.split(',')[1];
    if (!base64Data) return;

    let isActive = true; // Flag to prevent state updates on unmounted component

    const setupAudio = async () => {
        try {
            const rawAudioData = decode(base64Data);
            // Gemini TTS returns 24000Hz, 1 channel PCM data
            const buffer = await decodeAudioData(rawAudioData, audioContext, 24000, 1);
            if (isActive) {
              audioBufferRef.current = buffer;
              setIsReady(true);
            }
        } catch (error) {
            console.error("Failed to decode audio data:", error);
            if (isActive) {
              setIsReady(false);
            }
        }
    };
    
    setupAudio();
    
    // Cleanup
    return () => {
        isActive = false;
        sourceRef.current?.stop();
        setIsPlaying(false);
    };

  }, [audioSrc]);
  
  const togglePlay = useCallback(() => {
    if (!isReady || !audioContextRef.current || !audioBufferRef.current) return;
    
    // If audio context was suspended by browser policy, resume it
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start();
      source.onended = () => {
        setIsPlaying(false);
      };
      sourceRef.current = source;
      setIsPlaying(true);
    }
  }, [isPlaying, isReady]);

  return (
    <div className="flex items-center space-x-3 bg-sky-100 p-2 rounded-full">
      <button
        onClick={togglePlay}
        disabled={!isReady}
        className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
      <div className="w-full bg-sky-200 rounded-full h-2">
        {/* A real implementation would have a progress bar here */}
      </div>
    </div>
  );
};

export default AudioPlayer;
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Memory, MatchPair, QuizQuestion, TimelineEvent, GameDifficulty } from '@/types';

// Ensure the API key is available from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const safeJsonParse = <T>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error, "JSON string:", jsonString);
    return null;
  }
};

export const getDailyPrompt = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a single, nostalgic, and gentle prompt for a senior citizen to write a short memory about. For example: "What was your favorite childhood toy?" or "Describe the kitchen in the house you grew up in." Make it a question.',
      config: {
        maxOutputTokens: 50,
        temperature: 0.8,
      },
    });
    // FIX: Access the 'text' property directly from the response object.
    const text = response.text;
    if (!text) {
      console.warn('Daily prompt generation returned no text, using fallback.');
      return "What is a favorite memory from your childhood?";
    }
    return text.trim().replace(/"/g, "");
  } catch (error) {
    console.error("Error generating daily prompt:", error);
    return "What is a favorite memory from your childhood?";
  }
};

export const createMemoryMatchPairs = async (memories: Memory[], difficulty: GameDifficulty): Promise<MatchPair[]> => {
  const memoryContent = memories.map(m => m.content).join('\n---\n');
  if (memories.length < 3) return [];

  const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following user memories, create exactly ${pairCount} pairs of related words or short concepts for a memory matching game. The pairs should be directly related to the text. Difficulty: ${difficulty}.

Memories:
${memoryContent}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              word: { type: Type.STRING },
              match: { type: Type.STRING },
            },
            required: ['id', 'word', 'match'],
          },
        },
      },
    });

    // FIX: Access the 'text' property directly from the response object.
    const pairs = safeJsonParse<MatchPair[]>(response.text);
    return pairs || [];
  } catch (error) {
    console.error("Error creating memory match pairs:", error);
    return [];
  }
};

export const createStoryQuiz = async (memories: Memory[], difficulty: GameDifficulty): Promise<QuizQuestion[]> => {
  const memoryContent = memories.map(m => m.content).join('\n---\n');
  if (memories.length === 0) return [];

  const questionCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following user memories, create exactly ${questionCount} multiple-choice quiz questions. Each question must have exactly 4 options, and one must be the correct answer. The questions should be about specific details in the memories. Difficulty: ${difficulty}.

Memories:
${memoryContent}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer'],
          },
        },
      },
    });

    // FIX: Access the 'text' property directly from the response object.
    const questions = safeJsonParse<QuizQuestion[]>(response.text);
    return questions || [];
  } catch (error) {
    console.error("Error creating story quiz:", error);
    return [];
  }
};

export const createTimelineEvents = async (memories: Memory[], difficulty: GameDifficulty): Promise<TimelineEvent[]> => {
  const memoryContent = memories.map(m => m.content).join('\n---\n');
  if (memories.length < 3) return [];

  const eventCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `From the following memories, extract exactly ${eventCount} distinct events. List them in chronological order based on the stories provided. Each event description should be a short sentence. Difficulty: ${difficulty}.

Memories:
${memoryContent}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['id', 'description'],
          },
        },
      },
    });

    // FIX: Access the 'text' property directly from the response object.
    const events = safeJsonParse<TimelineEvent[]>(response.text);
    return events || [];
  } catch (error) {
    console.error("Error creating timeline events:", error);
    return [];
  }
};

export const generateImageForMemory = async (memoryContent: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `Create a nostalgic, warm, storybook-style illustration based on this memory: "${memoryContent}"` }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  if (!prompt.trim()) {
    console.error("Image generation prompt cannot be empty.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image from prompt:", error);
    return null;
  }
};

export const generateImageFromImageAndPrompt = async (imageDataUrl: string, prompt: string): Promise<string | null> => {
  if (!prompt.trim()) {
    console.error("Image generation prompt cannot be empty.");
    return null;
  }
  try {
    const parts = imageDataUrl.split(',');
    if (parts.length < 2) return null;
    
    const mimeTypeMatch = parts[0].match(/:(.*?);/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
      console.error("Invalid image data URL: Could not determine MIME type.");
      return null;
    }
    const mimeType = mimeTypeMatch[1];
    const base64Data = parts[1];

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: prompt,
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image from image and prompt:", error);
    return null;
  }
};

export const analyzeImageWithPrompt = async (imageDataUrl: string, prompt: string): Promise<string | null> => {
  if (!prompt.trim()) return "Prompt cannot be empty.";
  try {
    const parts = imageDataUrl.split(',');
    if (parts.length < 2) return null;
    
    const mimeTypeMatch = parts[0].match(/:(.*?);/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
      console.error("Invalid image data URL: Could not determine MIME type.");
      return null;
    }
    const mimeType = mimeTypeMatch[1];
    const base64Data = parts[1];

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    // FIX: Access the 'text' property directly from the response object.
    const resultText = response.text;
    if (!resultText) {
        return "I'm not sure how to respond to that."; // Fallback
    }
    return resultText.trim();
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Sorry, I encountered an error while analyzing the image.";
  }
};


export const generateAudioForMemory = async (memoryContent: string): Promise<string | null> => {
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ parts: [{ text: `Read this memory in a calm, gentle, and warm voice: ${memoryContent}` }] }],
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
              },
          },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/pcm';

      if (base64Audio) {
          return `data:${mimeType};base64,${base64Audio}`;
      }
      return null;
  } catch (error) {
      console.error("Error generating audio:", error);
      return null;
  }
};

export const generateCaptionForImage = async (imageDataUrl: string): Promise<string | null> => {
  try {
    const parts = imageDataUrl.split(',');
    if (parts.length < 2) return null;
    
    const mimeTypeMatch = parts[0].match(/:(.*?);/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
      console.error("Invalid image data URL: Could not determine MIME type.");
      return null;
    }
    const mimeType = mimeTypeMatch[1];
    const base64Data = parts[1];

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: "Analyze this image and write a short, one-sentence caption for a family scrapbook. Describe it as if it were a fond memory.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    // FIX: Access the 'text' property directly from the response object.
    const caption = response.text;
    if (!caption) {
        return "A lovely memory captured in a photo."; // Fallback caption
    }

    return caption.trim().replace(/"/g, "");
  } catch (error) {
    console.error("Error generating image caption:", error);
    return null;
  }
};

// FIX: Add missing 'generateCode' function to resolve import error in AIStudio.tsx.
export const generateCode = async (prompt: string, language: string): Promise<string | null> => {
  if (!prompt.trim()) {
    console.error("Code generation prompt cannot be empty.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using a more powerful model for coding tasks
      contents: `Generate a code snippet for the following prompt in the ${language} language. Only return the raw code, without any markdown backticks, explanations, or example usage.
Prompt: "${prompt}"`,
      config: {
        temperature: 0.2, // Lower temperature for more deterministic code output
      },
    });

    const code = response.text;
    if (!code) {
      return `// Sorry, I couldn't generate the code for that prompt.`;
    }
    return code.trim();
  } catch (error: any) {
    console.error("Error generating code:", error);
    return `// An error occurred while generating code: ${error.message}`;
  }
};

import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { generateImageFromPrompt, generateImageFromImageAndPrompt, analyzeImageWithPrompt } from '../services/geminiService';

interface AIStudioProps {
  user: User;
}

interface AIChatMessage {
    sender: 'ai' | 'user';
    text?: string;
    imageUrl?: string;
    avatar: string;
}

// Types for drawing functionality
interface Point {
    x: number;
    y: number;
}

interface Stroke {
    id: number;
    points: Point[];
    colorHex: string;
    tool: string;
}


const COLORS = [
    { name: 'coral-pink', hex: '#FF6F61' },
    { name: 'sunny-yellow', hex: '#FFD166' },
    { name: 'mint-green', hex: '#98D8C8' },
    { name: 'sky-blue', hex: '#89CFF0' },
    { name: 'purple-300', hex: '#C3B1E1' },
];

const TOOLS = ['edit', 'water_drop', 'blur_on', 'auto_awesome', 'palette'];

const PROMPT_CATEGORIES = [
    {
        title: "Life's Firsts",
        icon: "looks_one",
        prompts: ["My first car", "My first job", "The first house I lived in"],
    },
    {
        title: "Family & Friends",
        icon: "groups",
        prompts: ["A favorite family tradition", "A memory of a close friend", "A story my parents used to tell"],
    },
    {
        title: "Places & Journeys",
        icon: "explore",
        prompts: ["A memorable vacation", "The neighborhood I grew up in", "A place that feels like home"],
    },
    {
        title: "Sensory Memories",
        icon: "touch_app",
        prompts: ["A smell that brings back memories", "My favorite childhood meal", "A song that takes me back in time"],
    },
];

// FIX: Add types for the browser's SpeechRecognition API to resolve TypeScript errors.
interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognitionEvent {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            }
        }
        length: number;
    }
}

interface SpeechRecognition {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
}

// Add SpeechRecognition type for browser compatibility
interface IWindow extends Window {
  SpeechRecognition: SpeechRecognitionStatic;
  webkitSpeechRecognition: SpeechRecognitionStatic;
}

const AIStudio: React.FC<AIStudioProps> = ({ user }) => {
    const [messages, setMessages] = useState<AIChatMessage[]>([
        { sender: 'ai', text: "Hi there! What memory shall we explore today?", avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhgbCf3CZf0-ow9yjDgDcig5siMPh8ApsuuHHUehkgdWKLxLI8OeMxBmNuCgAbLCA9Ig7IoHvTLfg3nlyH1bHYt8E6QYZMl-NVJCAOedqnvN-F7Tb-NUzvjU8qW9WSvdkGGaAt9KB135JBG8IV8FhKrDGlUfjhIDpu3XyD_ZWUryFyViycHY7y4iWUWjRg1PBdqeV7T9M1zjbIrLu8AzSv31q0rNbzj-D7PgKeeQj08sCl0xCCQcE7ppmk1qN8AX-TnAJaK1Mt6gTt' },
        { sender: 'user', text: "Let's talk about my first car!", avatar: user.avatarUrl || '' },
    ]);
    const [input, setInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
    const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [labImage, setLabImage] = useState<string | null>(null);
    const [labPrompt, setLabPrompt] = useState('');
    const [labResultImage, setLabResultImage] = useState<string | null>(null);
    const [labResultText, setLabResultText] = useState<string | null>(null);
    const [isLabProcessing, setIsLabProcessing] = useState(false);
    const [labProcessingType, setLabProcessingType] = useState<'analyze' | 'generate' | null>(null);
    const labFileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        // FIX: Cast window to `unknown` then `IWindow` to satisfy TypeScript's strict type checking for non-standard browser APIs.
        const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setInput(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }
    }, []);

    const handleToggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setInput('');
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };


    const handleSend = () => {
        if (input.trim() || imagePreviewUrl) {
            const newUserMessage: AIChatMessage = { 
                sender: 'user', 
                text: input.trim() ? input.trim() : undefined,
                imageUrl: imagePreviewUrl,
                avatar: user.avatarUrl || '' 
            };
            setMessages(prev => [...prev, newUserMessage]);
            setInput('');
            setImagePreviewUrl(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                const aiResponse: AIChatMessage = { sender: 'ai', text: "That sounds wonderful! Tell me more.", avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhgbCf3CZf0-ow9yjDgDcig5siMPh8ApsuuHHUehkgdWKLxLI8OeMxBmNuCgAbLCA9Ig7IoHvTLfg3nlyH1bHYt8E6QYZMl-NVJCAOedqnvN-F7Tb-NUzvjU8qW9WSvdkGGaAt9KB135JBG8IV8FhKrDGlUfjhIDpu3XyD_ZWUryFyViycHY7y4iWUWjRg1PBdqeV7T9M1zjbIrLu8AzSv31q0rNbzj-D7PgKeeQj08sCl0xCCQcE7ppmk1qN8AX-TnAJaK1Mt6gTt' };
                setMessages(prev => [...prev, aiResponse]);
            }, 1000);
        }
    };

    const handlePromptClick = (promptText: string) => {
        setInput(promptText);
    };

    const getCoords = (e: React.MouseEvent<HTMLDivElement>): Point | null => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDrawing(true);
        const coords = getCoords(e);
        if (!coords) return;

        const newStroke: Stroke = {
            id: Date.now(),
            points: [coords],
            colorHex: COLORS.find(c => c.name === selectedColor)?.hex || '#FF6F61',
            tool: selectedTool,
        };
        setStrokes(prev => [...prev, newStroke]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing) return;
        const coords = getCoords(e);
        if (!coords) return;
        
        setStrokes(prev => prev.map((stroke, index) => {
            if (index === prev.length - 1) {
                return { ...stroke, points: [...stroke.points, coords] };
            }
            return stroke;
        }));
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };
    
    const pointsToPathData = (points: Point[]) => {
      if (points.length < 2) {
        return points.length === 1 ? `M ${points[0].x - 1} ${points[0].y} a 1 1 0 1 1 2 0 a 1 1 0 1 1 -2 0` : "";
      }
      return points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
      }, "");
    };

    const getToolProperties = (tool: string) => {
        switch (tool) {
            case 'edit': return { strokeWidth: '5' };
            case 'water_drop': return { strokeWidth: '2' };
            case 'blur_on': return { strokeWidth: '15', opacity: '0.5' };
            case 'auto_awesome': return { strokeWidth: '5', strokeDasharray: '2 8' };
            default: return { strokeWidth: '5' };
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreviewUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePreview = () => {
        setImagePreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) return;

        setIsGeneratingImage(true);
        setGeneratedImageUrl(null); // Clear previous image

        const imageUrl = await generateImageFromPrompt(imagePrompt);

        if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
        } else {
            // Handle error case - maybe set an error message state
            console.error("Failed to generate image.");
        }
        setIsGeneratingImage(false);
    };

    const handleLabImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                if (imageUrl) {
                    setLabImage(imageUrl);
                    setLabResultImage(null);
                    setLabResultText(null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLabImage = () => {
        setLabImage(null);
        setLabResultImage(null);
        setLabResultText(null);
        setLabPrompt('');
        if (labFileInputRef.current) {
            labFileInputRef.current.value = '';
        }
    };

    const handleAnalyzeLabImage = async () => {
        if (!labImage || !labPrompt.trim()) return;

        setIsLabProcessing(true);
        setLabProcessingType('analyze');
        setLabResultImage(null);
        setLabResultText(null);
        
        const result = await analyzeImageWithPrompt(labImage, labPrompt);

        setLabResultText(result ?? "Sorry, I couldn't analyze the image.");
        
        setIsLabProcessing(false);
        setLabProcessingType(null);
    };

    const handleGenerateFromLabImage = async () => {
        if (!labImage || !labPrompt.trim()) return;

        setIsLabProcessing(true);
        setLabProcessingType('generate');
        setLabResultImage(null);
        setLabResultText(null);

        const result = await generateImageFromImageAndPrompt(labImage, labPrompt);

        if (result) {
            setLabResultImage(result);
        } else {
            setLabResultText("Sorry, I couldn't generate a new image.");
        }

        setIsLabProcessing(false);
        setLabProcessingType(null);
    };
    
    const handleSaveDrawing = () => {
        const svgElement = svgRef.current;
        const canvasContainer = canvasRef.current;
        if (!svgElement || !canvasContainer) return;

        // Get dimensions from the container
        const { width, height } = canvasContainer.getBoundingClientRect();

        // Serialize SVG to a string
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

        const img = new Image();
        img.onload = () => {
            // Create a canvas to draw on
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            // Set a white background for the PNG
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the SVG image onto the canvas
            ctx.drawImage(img, 0, 0);

            // Trigger download
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'memory-drawing.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = svgUrl;
    };


    return (
        <div className="pb-28">
            {/* Top App Bar */}
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-light-cream">
                <div className="w-12"></div>
                <h1 className="text-warm-gray text-xl font-bold text-center">AI Studio</h1>
                <div className="w-12 flex justify-end">
                    <button className="p-2 text-warm-gray">
                        <span className="material-symbols-outlined text-3xl">help</span>
                    </button>
                </div>
            </header>

            {/* AI Chatbot Module */}
            <div className="px-4 pt-4">
                <h2 className="text-warm-gray text-lg font-bold">AI Chatbot</h2>
                <div className="flex flex-col gap-4 p-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center justify-center rounded-full w-10 h-10 shrink-0 ${msg.sender === 'ai' ? 'bg-sky-blue/20' : ''}`}>
                                <img className={`w-full h-full object-cover rounded-full ${msg.sender === 'ai' ? 'p-1' : ''}`} src={msg.avatar} alt={`${msg.sender} avatar`} />
                            </div>
                            <div className={`flex flex-1 flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <p className="text-warm-gray/70 text-xs font-normal">{msg.sender === 'ai' ? 'Brainy' : 'Me'}</p>
                                <div className={`rounded-xl max-w-xs ${msg.sender === 'ai' ? 'bg-sky-blue/30' : 'bg-coral-pink'} ${!msg.text ? 'p-1.5' : 'px-4 py-3'}`}>
                                  {msg.text && <p className={`text-base font-normal leading-normal ${msg.sender === 'user' ? 'text-white' : 'text-warm-gray'}`}>{msg.text}</p>}
                                  {msg.imageUrl && (
                                    <div className={`mt-${msg.text ? '2' : '0'} rounded-md overflow-hidden`}>
                                      <img src={msg.imageUrl} alt="User upload" className="w-full h-auto" />
                                    </div>
                                  )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-start">
                    {imagePreviewUrl && (
                      <div className="relative w-24 h-24 mb-2 p-1 bg-white rounded-lg shadow-md border">
                        <img src={imagePreviewUrl} alt="Image preview" className="w-full h-full object-cover rounded" />
                        <button
                          onClick={handleRemovePreview}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-red-500 transition"
                          aria-label="Remove image preview"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    <div className="w-full flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                        <button onClick={() => fileInputRef.current?.click()} disabled={isRecording} className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white text-warm-gray/80 shadow-sm border border-gray-200 hover:bg-gray-100 transition disabled:opacity-50">
                            <span className="material-symbols-outlined">add_photo_alternate</span>
                        </button>
                         <button onClick={handleToggleRecording} className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full shadow-sm border transition-colors ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-warm-gray/80 border-gray-200 hover:bg-gray-100'}`}>
                            <span className="material-symbols-outlined">{isRecording ? 'stop_circle' : 'mic'}</span>
                        </button>
                        <div className="relative flex-grow">
                             <input
                                className="w-full rounded-full border-none bg-white py-3 pl-5 pr-14 text-warm-gray placeholder-warm-gray/50 focus:ring-2 focus:ring-coral-pink shadow-sm disabled:bg-gray-100"
                                placeholder={isRecording ? "Listening..." : "Type your message..."}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isRecording}
                            />
                            <button onClick={handleSend} disabled={isRecording} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-coral-pink text-white disabled:bg-coral-pink/50">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inspiration Hub Module */}
            <div className="px-4 pt-8">
                <div className="bg-white border border-sky-blue/50 rounded-lg p-4">
                    <h2 className="text-warm-gray text-lg font-bold pb-1">Inspiration Hub</h2>
                    <p className="text-warm-gray/80 text-sm mb-4">Click a suggestion to start writing about it.</p>
                    <div className="space-y-4">
                        {PROMPT_CATEGORIES.map(category => (
                            <div key={category.title}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-coral-pink">{category.icon}</span>
                                    <h3 className="text-warm-gray font-semibold">{category.title}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {category.prompts.map(prompt => (
                                        <button
                                            key={prompt}
                                            onClick={() => handlePromptClick(prompt)}
                                            className="px-3 py-1.5 bg-sky-100 text-sky-700 font-medium rounded-full hover:bg-sky-200 transition-colors text-sm"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 p-4 rounded-lg bg-white border-l-4 border-sunny-yellow">
                    <p className="text-warm-gray font-normal">"Tell me about the best birthday party you ever had."</p>
                </div>
            </div>

            {/* Image Creator Module */}
            <div className="px-4 pt-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-warm-gray text-lg font-bold">Image Creator</h2>
                        <p className="text-warm-gray text-base font-normal">Bring your words to life.</p>
                    </div>
                </div>
                <div className="mt-4 space-y-4">
                    <textarea
                        className="w-full rounded-lg border-gray-200 p-4 text-warm-gray placeholder-warm-gray/50 focus:ring-2 focus:ring-coral-pink shadow-sm disabled:bg-gray-100"
                        placeholder="e.g., A bright red Schwinn bicycle with tassels on a sunny suburban street"
                        rows={3}
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        disabled={isGeneratingImage}
                    />
                    <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-coral-pink text-white text-lg font-bold rounded-full shadow-lg hover:bg-coral-pink/90 transition disabled:bg-coral-pink/50 disabled:cursor-wait"
                    >
                        {isGeneratingImage ? (
                            <>
                                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span>Generate Image</span>
                            </>
                        )}
                    </button>
                    <div className="relative aspect-video w-full rounded-lg bg-white flex items-center justify-center border border-gray-200 overflow-hidden">
                        {isGeneratingImage && (
                            <div className="flex flex-col items-center gap-2 text-warm-gray/70">
                                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-coral-pink"></div>
                                <p>Creating your vision...</p>
                            </div>
                        )}
                        {!isGeneratingImage && generatedImageUrl && (
                            <img src={generatedImageUrl} alt="AI generated" className="w-full h-full object-contain" />
                        )}
                        {!isGeneratingImage && !generatedImageUrl && (
                            <div className="text-center text-warm-gray/50 pointer-events-none">
                                <span className="material-symbols-outlined text-5xl">image</span>
                                <p>Your generated image will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Lab Module */}
            <div className="px-4 pt-8">
                <h2 className="text-warm-gray text-lg font-bold">Image Lab</h2>
                <p className="text-warm-gray text-base font-normal">Upload an image to analyze or edit with AI.</p>
                
                <div className="mt-4 space-y-4">
                    <div className="relative aspect-video w-full rounded-lg bg-white flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                        {labImage ? (
                            <>
                                <img src={labImage} alt="Uploaded for lab" className="w-full h-full object-contain" />
                                <button onClick={handleRemoveLabImage} className="absolute top-2 right-2 w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-red-500 transition z-10" aria-label="Remove image">
                                    &times;
                                </button>
                            </>
                        ) : (
                            <div className="text-center text-warm-gray/50 p-4">
                                <input type="file" ref={labFileInputRef} onChange={handleLabImageUpload} accept="image/*" className="hidden"/>
                                <button onClick={() => labFileInputRef.current?.click()} className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                                   <span className="material-symbols-outlined text-5xl text-warm-gray/70">upload_file</span>
                                </button>
                                <p className="mt-2 text-sm">Upload an image</p>
                            </div>
                        )}
                    </div>

                    {labImage && (
                        <>
                            <textarea
                                className="w-full rounded-lg border-gray-200 p-4 text-warm-gray placeholder-warm-gray/50 focus:ring-2 focus:ring-coral-pink shadow-sm disabled:bg-gray-100"
                                placeholder="e.g., 'Add a birthday hat' or 'What city is this?'"
                                rows={2}
                                value={labPrompt}
                                onChange={(e) => setLabPrompt(e.target.value)}
                                disabled={isLabProcessing}
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={handleAnalyzeLabImage}
                                    disabled={isLabProcessing || !labPrompt.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-sky-blue text-white font-bold rounded-full shadow-lg hover:bg-sky-blue/90 transition disabled:bg-sky-blue/50 disabled:cursor-wait"
                                >
                                    {isLabProcessing && labProcessingType === 'analyze' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">question_answer</span>
                                            <span>Analyze</span>
                                        </>
                                    )}
                                </button>
                                 <button
                                    onClick={handleGenerateFromLabImage}
                                    disabled={isLabProcessing || !labPrompt.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-coral-pink text-white font-bold rounded-full shadow-lg hover:bg-coral-pink/90 transition disabled:bg-coral-pink/50 disabled:cursor-wait"
                                >
                                    {isLabProcessing && labProcessingType === 'generate' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">auto_fix_high</span>
                                            <span>Generate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {(labResultImage || labResultText) && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                            <h3 className="text-lg font-bold text-warm-gray mb-2">Result</h3>
                            {labResultImage && (
                                <div className="aspect-video w-full rounded-lg bg-gray-100 overflow-hidden">
                                    <img src={labResultImage} alt="AI generated result" className="w-full h-full object-contain" />
                                </div>
                            )}
                            {labResultText && (
                                <p className="text-warm-gray whitespace-pre-wrap">{labResultText}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Draw a Memory Module */}
            <div className="px-4 pt-8">
                 <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-warm-gray text-lg font-bold">Draw a Memory</h2>
                        <p className="text-warm-gray text-base font-normal">Pick a color and bring your story to life!</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSaveDrawing} className="px-4 py-2 bg-mint-500 text-white text-sm font-semibold rounded-full hover:bg-mint-600 transition">
                            Save
                        </button>
                        <button onClick={() => setStrokes([])} className="px-4 py-2 bg-gray-200 text-sm font-semibold rounded-full text-warm-gray hover:bg-gray-300 transition">
                            Clear
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-4 pt-4 space-y-4">
                <div
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative aspect-video w-full rounded-lg bg-white flex items-center justify-center border border-gray-200 cursor-crosshair overflow-hidden touch-none"
                >
                    {strokes.length === 0 && <p className="text-warm-gray/50 pointer-events-none">Click and drag to draw</p>}
                    <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full">
                        {strokes.map(stroke => (
                            <path
                                key={stroke.id}
                                d={pointsToPathData(stroke.points)}
                                stroke={stroke.colorHex}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                {...getToolProperties(stroke.tool)}
                            />
                        ))}
                    </svg>
                </div>
                {/* Color Palette */}
                <div className="flex justify-between items-center space-x-2">
                    {COLORS.map(color => (
                        <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-10 h-10 rounded-full transition-all duration-200 ${selectedColor === color.name ? 'ring-2 ring-offset-2 ring-warm-gray' : 'ring-0'}`}
                            style={{ backgroundColor: color.hex }}
                            aria-label={`Select color ${color.name}`}
                        />
                    ))}
                    <button className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-warm-gray"><span className="material-symbols-outlined">add</span></button>
                </div>
                {/* Brush Selector */}
                <div className="flex items-center justify-around bg-white rounded-full p-2 shadow-sm">
                    {TOOLS.map(tool => (
                        <button
                            key={tool}
                            onClick={() => setSelectedTool(tool)}
                            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${selectedTool === tool ? 'bg-coral-pink/20 text-coral-pink' : 'text-warm-gray/60'}`}
                            aria-label={`Select tool ${tool}`}
                        >
                            <span className="material-symbols-outlined">{tool === 'edit' ? 'brush' : tool}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AIStudio;
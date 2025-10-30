import React, { useState, useEffect } from 'react';
import Onboarding from './src/components/Onboarding';
import { View, User, Memory, GameType, FamilyMember, PendingContribution, ChatMessage } from './src/types';
import { generateImageForMemory, generateAudioForMemory, generateCaptionForImage } from './src/services/geminiService';
import Layout from './src/components/Layout';
import Home from './src/views/Home';
import Scrapbook from './src/views/Scrapbook';
import GameLobby from './src/views/GameLobby';
import Family from './src/views/Family';
import Profile from './src/views/Profile';
import Upgrade from './src/views/Upgrade';
import MemoryMatchUp from './src/games/MemoryMatchUp';
import StoryQuizQuest from './src/games/StoryQuizQuest';
import TimelineTango from './src/games/TimelineTango';
import EchoEcho from './src/games/EchoEcho';
import LegacyLink from './src/games/LegacyLink';
import SnapshotSolve from './src/games/SnapshotSolve';
import AIStudio from './src/views/AIStudio';
import { CheckCircleIcon } from './src/components/Icons';

const MOCK_USER: User = {
    name: 'Alex',
    age: 72,
    avatar: 'woman',
    avatarUrl: 'https://storage.googleapis.com/aida-static/enterprise/memory-keeper/you.webp',
    theme: 'nostalgic',
    plan: 'free',
    memoryStrength: 75,
    streak: 3,
    longestStreak: 5,
};

const MOCK_MEMORIES: Memory[] = [
    {
        id: '1',
        content: 'I remember my first bicycle. It was a bright red Schwinn with tassels on the handlebars. My dad ran behind me for what felt like miles down our street until I finally found my balance.',
        tags: ['childhood', 'family', 'bicycle'],
        timestamp: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    },
    {
        id: '2',
        content: 'Baking apple pies with my grandmother was a yearly tradition. The whole house would smell of cinnamon and sugar. Her secret was a little bit of lemon zest in the crust.',
        tags: ['family', 'baking', 'grandmother', 'tradition'],
        timestamp: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    },
    {
        id: '3',
        content: 'Our first family vacation to the beach was magical. I built a giant sandcastle with my brother and we collected seashells all day. I got a terrible sunburn but it was worth it.',
        tags: ['vacation', 'family', 'beach', 'childhood'],
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    }
];

const MOCK_FAMILY: FamilyMember[] = [
    { id: 'fm1', name: 'Anne (Gran)', permission: 'contribute', avatarUrl: 'https://storage.googleapis.com/aida-static/enterprise/memory-keeper/anne-gran.webp' },
    { id: 'fm2', name: 'John (Dad)', permission: 'contribute', avatarUrl: 'https://storage.googleapis.com/aida-static/enterprise/memory-keeper/john-dad.webp' },
    { id: 'fm3', name: 'Mark', permission: 'view', avatarUrl: '' }
];

const MOCK_CONTRIBUTIONS: PendingContribution[] = [
    { id: 'pc1', familyMemberName: 'Anne (Gran)', photo: 'https://placehold.co/200x200/F5A623/FFF', caption: 'Found this old photo of you at the lake, Mom!' },
];

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 'msg1',
        senderName: 'Anne (Gran)',
        senderAvatar: MOCK_FAMILY[0].avatarUrl,
        text: "Remember our trip to the beach in '82? Here's a photo from that day! The water was so warm.",
        imageUrl: "https://storage.googleapis.com/aida-static/enterprise/memory-keeper/beach-82.webp",
        reactions: { '❤️': ['John (Dad)', 'You'], '😄': ['Mark', 'You'] },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
        id: 'msg2',
        senderName: 'You',
        senderAvatar: '',
        text: "I remember that day so well! It was so much fun building that giant sandcastle.",
        reactions: { '🎉': ['Anne (Gran)'] },
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
    {
        id: 'msg3',
        senderName: 'John (Dad)',
        senderAvatar: MOCK_FAMILY[1].avatarUrl,
        text: "Haha, yes! And remember we found that huge seashell? I think it's still on the mantelpiece.",
        reactions: {},
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    }
];

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [pendingContributions, setPendingContributions] = useState<PendingContribution[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [activeView, setActiveView] = useState<View>('home');
    const [isGenerating, setIsGenerating] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('memory-keeper-user');
            if(savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                const savedMemories = localStorage.getItem(`memory-keeper-memories-${parsedUser.name}`);
                setMemories(savedMemories ? JSON.parse(savedMemories) : MOCK_MEMORIES);
                
                setFamilyMembers(MOCK_FAMILY);
                setPendingContributions(MOCK_CONTRIBUTIONS);
                
                const userMessages = MOCK_CHAT_MESSAGES.map(msg => 
                    msg.senderName === 'You' ? { ...msg, senderName: parsedUser.name, senderAvatar: parsedUser.avatarUrl || '' } : msg
                );
                setChatMessages(userMessages);

            } else {
                setActiveView('onboarding');
            }
        } catch (error) {
            console.error("Failed to load from localStorage", error);
            setActiveView('onboarding');
        }
    }, []);

    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem('memory-keeper-user', JSON.stringify(user));
                localStorage.setItem(`memory-keeper-memories-${user.name}`, JSON.stringify(memories));
            } catch (error) {
                console.error("Failed to save to localStorage", error);
            }
        }
    }, [user, memories]);

    const handleOnboardingComplete = (userData: Omit<User, 'memoryStrength' | 'streak' | 'longestStreak' | 'trialEndDate'>) => {
        const newUser: User = {
            ...MOCK_USER, // Start with mock stats
            ...userData,
        };
        setUser(newUser);
        setMemories(MOCK_MEMORIES); // Initialize with mock memories for new user
        setActiveView('home');
    };
    
    const handleSaveMemory = (data: { content: string; tags: string; image?: string }) => {
        if (!user) return;
        const newMemory: Memory = {
            id: new Date().toISOString(),
            content: data.content,
            tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
            timestamp: new Date().toISOString(),
            image: data.image,
        };
        setMemories(prev => [newMemory, ...prev]);
        setUser(u => u ? ({ ...u, streak: u.streak + 1, longestStreak: Math.max(u.longestStreak, u.streak + 1) }) : null);
    };

    const handleGenerateImage = async (memoryId: string) => {
        const memory = memories.find(m => m.id === memoryId);
        if (!memory || memory.image) return;

        setIsGenerating(true);
        const imageUrl = await generateImageForMemory(memory.content);
        if (imageUrl) {
            setMemories(prev => prev.map(m => m.id === memoryId ? { ...m, image: imageUrl } : m));
        }
        setIsGenerating(false);
    };

    const handleGenerateAudio = async (memoryId: string) => {
        const memory = memories.find(m => m.id === memoryId);
        if (!memory || memory.audio) return;

        setIsGenerating(true);
        const audioUrl = await generateAudioForMemory(memory.content);
        if (audioUrl) {
            setMemories(prev => prev.map(m => m.id === memoryId ? { ...m, audio: audioUrl } : m));
        }
        setIsGenerating(false);
    };

    const handleDeleteMemories = (memoryIds: string[]) => {
        const idsToDelete = new Set(memoryIds);
        setMemories(prev => prev.filter(m => !idsToDelete.has(m.id)));
    };

    const handleNavigate = (view: View) => {
        setActiveView(view);
    };

    const handleGameSelect = (gameType: GameType) => {
        const gameViewMap: Record<GameType, View> = {
            [GameType.MemoryMatchUp]: 'game-memory-match-up',
            [GameType.StoryQuizQuest]: 'game-story-quiz-quest',
            [GameType.TimelineTango]: 'game-timeline-tango',
            [GameType.EchoEcho]: 'game-echo-echo',
            [GameType.LegacyLink]: 'game-legacy-link',
            [GameType.SnapshotSolve]: 'game-snapshot-solve',
        };
        setActiveView(gameViewMap[gameType]);
    };
    
    const handleGameComplete = (score: number, gameType: GameType) => {
        console.log(`Game ${gameType} completed with score: ${score}`);
        setUser(u => u ? ({ ...u, memoryStrength: Math.min(100, Math.max(0, Math.round(u.memoryStrength * 0.9 + score * 0.1))) }) : null);
        setActiveView('games');
    };

    const handleStartTrial = () => {
        setUser(u => u ? ({ ...u, plan: 'premium', trialEndDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString() }) : null);
        setActiveView('profile');
    };
    
    const handleSendMessage = async (messageContent: { text?: string; imageUrl?: string }) => {
        if (!user || (!messageContent.text?.trim() && !messageContent.imageUrl)) return;

        const newMessage: ChatMessage = {
            id: new Date().toISOString(),
            senderName: user.name,
            senderAvatar: user.avatarUrl || '',
            reactions: {},
            timestamp: new Date().toISOString(),
            ...messageContent,
        };
        setChatMessages(prev => [...prev, newMessage]);

        if (newMessage.imageUrl) {
            setIsGenerating(true);
            const caption = await generateCaptionForImage(newMessage.imageUrl);
            setIsGenerating(false);

            if (caption) {
                const newMemory: Memory = {
                    id: `${new Date().toISOString()}-shared`,
                    content: caption,
                    tags: ['family photo', 'shared'],
                    timestamp: new Date().toISOString(),
                    image: newMessage.imageUrl,
                };
                setMemories(prev => [newMemory, ...prev]);
                
                setNotification('Photo & caption saved to your Scrapbook!');
                setTimeout(() => setNotification(null), 3500);
            }
        }
    };

    const handleUpdateMessage = (messageId: string, newText: string) => {
        setChatMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId
                    ? { ...msg, text: newText, edited: true }
                    : msg
            )
        );
    };

    const handleToggleReaction = (messageId: string, emoji: string) => {
        if (!user) return;
        const userName = user.name;
    
        setChatMessages(prevMessages =>
            prevMessages.map(msg => {
                if (msg.id === messageId) {
                    const newReactions = { ...msg.reactions };
                    const reactors = newReactions[emoji] || [];
                    
                    if (reactors.includes(userName)) {
                        newReactions[emoji] = reactors.filter(name => name !== userName);
                        if (newReactions[emoji].length === 0) {
                            delete newReactions[emoji];
                        }
                    } else {
                        newReactions[emoji] = [...reactors, userName];
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            })
        );
    };

    if (!user || activeView === 'onboarding') {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    const renderContent = () => {
        switch (activeView) {
            case 'home':
                return <Home user={user} onSaveMemory={handleSaveMemory} />;
            case 'scrapbook':
                return <Scrapbook memories={memories} onGenerateImage={handleGenerateImage} onGenerateAudio={handleGenerateAudio} onDeleteMemories={handleDeleteMemories} isGenerating={isGenerating} />;
            case 'games':
                return <GameLobby onSelectGame={handleGameSelect} />;
            case 'family':
                return <Family 
                    user={user}
                    familyMembers={familyMembers}
                    chatMessages={chatMessages}
                    pendingContributionsCount={pendingContributions.length}
                    onInviteMember={(name, permission) => setFamilyMembers(prev => [...prev, {id: new Date().toISOString(), name, permission, avatarUrl: ''}])}
                    onSendMessage={handleSendMessage}
                    onUpdateMessage={handleUpdateMessage}
                    onToggleReaction={handleToggleReaction}
                    isGenerating={isGenerating}
                />;
            case 'profile':
                return <Profile user={user} onNavigate={handleNavigate} />;
            case 'upgrade':
                return <Upgrade onBack={() => setActiveView('profile')} onStartTrial={handleStartTrial} />;
            case 'game-memory-match-up':
                return <MemoryMatchUp user={user} memories={memories} onComplete={handleGameComplete} />;
            case 'game-story-quiz-quest':
                return <StoryQuizQuest user={user} memories={memories} onComplete={handleGameComplete} />;
            case 'game-timeline-tango':
                return <TimelineTango user={user} memories={memories} onComplete={handleGameComplete} />;
            case 'game-echo-echo':
                 return <EchoEcho onComplete={handleGameComplete} />;
            case 'game-legacy-link':
                 return <LegacyLink onComplete={handleGameComplete} />;
            case 'game-snapshot-solve':
                 return <SnapshotSolve onComplete={handleGameComplete} />;
            case 'aistudio':
                return <AIStudio user={user} />;
            default:
                return <Home user={user} onSaveMemory={handleSaveMemory} />;
        }
    };

    return (
        <Layout activeView={activeView} onNavigate={handleNavigate}>
            {renderContent()}
            <div
                className={`fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 bg-mint-500 text-white rounded-full shadow-lg transition-all duration-300 ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <CheckCircleIcon className="w-6 h-6" />
                <span className="font-bold">{notification}</span>
            </div>
        </Layout>
    );
};

export default App;

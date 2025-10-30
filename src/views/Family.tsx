import React, { useState, useRef, useEffect } from 'react';
import { User, FamilyMember, ChatMessage, Permission } from '@/types';

interface FamilyProps {
    user: User;
    familyMembers: FamilyMember[];
    chatMessages: ChatMessage[];
    pendingContributionsCount: number;
    onInviteMember: (name: string, permission: Permission) => void;
    onSendMessage: (message: { text?: string; imageUrl?: string }) => void;
    onUpdateMessage: (messageId: string, newText: string) => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
    isGenerating: boolean;
}

const Reaction: React.FC<{
  emoji: string;
  reactors: string[];
  isReactedByCurrentUser: boolean;
  onClick: () => void;
}> = ({ emoji, reactors, isReactedByCurrentUser, onClick }) => {
  const count = reactors.length;
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full shadow-sm border transition-colors ${
        isReactedByCurrentUser
          ? 'bg-coral-100 border-coral-400'
          : 'bg-white border-gray-200 hover:bg-gray-100'
      }`}
      aria-label={`${count} ${emoji} reactions, click to ${isReactedByCurrentUser ? 'remove' : 'add'} yours`}
    >
      <span className="text-sm">{emoji}</span>
      <p className="text-gray-600 text-xs font-bold">{count}</p>
    </button>
  );
};

interface MessageBubbleProps {
    user: User;
    message: ChatMessage;
    isOwnMessage: boolean;
    onUpdateMessage: (messageId: string, newText: string) => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
}

const EMOJIS = ['❤️', '🎉', '😄', '👍', '😂'];

const ReactionPicker: React.FC<{ onSelect: (emoji: string) => void, isOwnMessage: boolean }> = ({ onSelect, isOwnMessage }) => (
    <div className={`absolute -top-10 ${isOwnMessage ? 'left-0' : 'right-0'} z-20 flex items-center gap-1 p-1.5 bg-white rounded-full shadow-lg transition-opacity duration-200`}>
        {EMOJIS.map(emoji => (
            <button
                key={emoji}
                onClick={(e) => { e.stopPropagation(); onSelect(emoji); }}
                className="text-xl hover:scale-125 transition-transform"
                aria-label={`React with ${emoji}`}
            >
                {emoji}
            </button>
        ))}
    </div>
);


const MessageBubble: React.FC<MessageBubbleProps> = ({ user, message, isOwnMessage, onUpdateMessage, onToggleReaction }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(message.text || '');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing) {
            textAreaRef.current?.focus();
            textAreaRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editedText.trim() && editedText.trim() !== (message.text || '')) {
            onUpdateMessage(message.id, editedText.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedText(message.text || '');
        setIsEditing(false);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    }

    const handleSelectReaction = (emoji: string) => {
        onToggleReaction(message.id, emoji);
        setIsPickerVisible(false);
    };

    if (isEditing) {
        return (
             <div className="flex items-end gap-3 justify-end">
                <div className="flex flex-1 flex-col gap-1 items-end">
                   <div className="rounded-lg p-3.5 bg-primary w-full max-w-xs sm:max-w-sm">
                       <textarea
                           ref={textAreaRef}
                           value={editedText}
                           onChange={(e) => setEditedText(e.target.value)}
                           onKeyDown={handleKeyDown}
                           className="w-full bg-transparent text-white focus:outline-none resize-none text-base font-normal leading-normal"
                           rows={3}
                       />
                       <div className="flex justify-end items-center gap-2 mt-2">
                           <button onClick={handleCancel} className="text-xs font-bold text-white/80 hover:text-white">Cancel</button>
                           <button onClick={handleSave} className="text-xs font-bold text-white px-3 py-1 bg-white/30 rounded-full hover:bg-white/40">Save</button>
                       </div>
                   </div>
                </div>
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" style={{ backgroundImage: `url(${message.senderAvatar})` }}></div>
            </div>
        );
    }

    return (
        <div className={`group flex items-end gap-3 ${isOwnMessage ? 'justify-end' : ''}`}>
            {!isOwnMessage && (
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" style={{ backgroundImage: `url(${message.senderAvatar})` }}></div>
            )}
            <div className={`flex flex-1 flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <p className="text-gray-500 text-[13px] font-medium leading-normal max-w-[360px] px-2">{isOwnMessage ? 'You' : message.senderName}</p>
                
                <div className="relative" onMouseEnter={() => setIsPickerVisible(true)} onMouseLeave={() => setIsPickerVisible(false)}>
                    {message.text && (
                        <div className={`relative rounded-lg p-3.5 text-base font-normal leading-normal max-w-xs sm:max-w-sm ${isOwnMessage ? 'rounded-br-none bg-primary text-white' : 'rounded-bl-none bg-white shadow-sm text-gray-800'}`}>
                            <p>{message.text}</p>
                            {isOwnMessage && !message.imageUrl && (
                                <button onClick={() => setIsEditing(true)} className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-200 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="Edit message">
                                    <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                            )}
                            {message.edited && <span className={`text-xs ml-2 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>(edited)</span>}
                        </div>
                    )}
                    
                    {message.imageUrl && (
                        <div className="bg-center bg-no-repeat aspect-video bg-cover rounded-lg w-full max-w-[280px] mt-2" style={{ backgroundImage: `url(${message.imageUrl})` }}></div>
                    )}

                    {isPickerVisible && <ReactionPicker onSelect={handleSelectReaction} isOwnMessage={isOwnMessage} />}
                </div>

                {Object.keys(message.reactions).length > 0 && (
                        <div className={`flex flex-wrap items-center gap-1.5 mt-1.5 ${isOwnMessage ? 'justify-end' : ''}`}>
                        {Object.keys(message.reactions).map((emoji) => {
// FIX: Use `Object.keys` and direct property access to ensure proper type inference for `reactors`.
                            const reactors = message.reactions[emoji];
                            return (
                                <Reaction
                                    key={emoji}
                                    emoji={emoji}
                                    reactors={reactors}
                                    isReactedByCurrentUser={reactors.includes(user.name)}
                                    onClick={() => onToggleReaction(message.id, emoji)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
             {isOwnMessage && (
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" style={{ backgroundImage: `url(${message.senderAvatar})` }}></div>
            )}
        </div>
    );
};

const InviteModal: React.FC<{onClose: () => void, onInvite: (name: string, permission: Permission) => void}> = ({ onClose, onInvite }) => {
    const [name, setName] = useState('');
    const [permission, setPermission] = useState<Permission>('view');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            onInvite(name.trim(), permission);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-800">Invite a Family Member</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Family member's name" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400" />
                    <select value={permission} onChange={e => setPermission(e.target.value as Permission)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400 bg-white">
                        <option value="view">View Only</option>
                        <option value="comment">Can Comment</option>
                        <option value="contribute">Can Contribute</option>
                    </select>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={!name.trim()} className="px-6 py-2 bg-coral-500 text-white font-bold rounded-full shadow-lg hover:bg-coral-600 disabled:bg-gray-400">Send Invite</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MemberDetailModal: React.FC<{ member: FamilyMember | { id: string, name: string, avatarUrl: string, permission: Permission }, onClose: () => void }> = ({ member, onClose }) => {
    const getPermissionText = (permission: Permission) => {
        switch (permission) {
            case 'view': return 'Can view memories';
            case 'comment': return 'Can comment on memories';
            case 'contribute': return 'Can contribute memories';
            default: return 'No permissions set';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 space-y-4 animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
                <div className={`mx-auto bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 border-4 border-white shadow-lg ${member.avatarUrl ? '' : 'bg-gray-200 flex items-center justify-center'}`} style={{backgroundImage: `url(${member.avatarUrl})`}}>
                    {!member.avatarUrl && <span className="material-symbols-outlined text-gray-500 text-6xl">person</span>}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{member.name}</h2>
                <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold">Permissions</p>
                    <p className="text-gray-700 capitalize">{getPermissionText(member.permission)}</p>
                </div>
                <button onClick={onClose} className="w-full mt-2 px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300">Close</button>
            </div>
        </div>
    );
};


const Family: React.FC<FamilyProps> = ({ user, familyMembers, chatMessages, pendingContributionsCount, onInviteMember, onSendMessage, onUpdateMessage, onToggleReaction, isGenerating }) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | { id: string, name: string, avatarUrl: string, permission: Permission } | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const allParticipants = [
        { id: 'user', name: 'You', avatarUrl: user.avatarUrl || '', permission: 'contribute' as Permission },
        ...familyMembers
    ];
    
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [chatMessages]);

    const handleSend = () => {
        if (newMessage.trim() || imagePreviewUrl) {
            onSendMessage({
                text: newMessage.trim() ? newMessage.trim() : undefined,
                imageUrl: imagePreviewUrl ? imagePreviewUrl : undefined,
            });
            setNewMessage('');
            setImagePreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                if (imageUrl) {
                    setImagePreviewUrl(imageUrl);
                }
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

    return (
    <div className="h-full flex flex-col">
      <header className="p-4 pt-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Our Family Story</h1>
      </header>
      
      {/* Avatar Group */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-start gap-4 overflow-x-auto pb-2">
            {allParticipants.map((member) => (
                <button 
                    key={member.id} 
                    onClick={() => setSelectedMember(member)} 
                    className="flex flex-col items-center gap-2 text-center flex-shrink-0 w-16 focus:outline-none focus:ring-2 focus:ring-coral-400 rounded-lg p-1 transition-transform transform hover:scale-105"
                >
                    <div className="relative">
                        <div className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-14 ${member.avatarUrl ? '' : 'bg-gray-200 flex items-center justify-center'}`} style={{backgroundImage: `url(${member.avatarUrl})`}}>
                            {!member.avatarUrl && <span className="material-symbols-outlined text-gray-500 text-2xl">person</span>}
                        </div>
                         {pendingContributionsCount > 0 && member.name.includes('Anne') && ( // Example: badge on grandma
                            <div className="absolute top-0 right-0 text-xs font-bold text-white bg-red-500 w-5 h-5 flex items-center justify-center rounded-full border-2 border-background-light">1</div>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium truncate w-full">{member.name}</p>
                </button>
            ))}
        </div>
      </div>

      {/* Main Chat Feed */}
      <main className="flex-1 space-y-4 px-4 pb-44 pt-2 overflow-y-auto">
        {chatMessages.map(message => (
            <MessageBubble key={message.id} user={user} message={message} isOwnMessage={message.senderName === user.name} onUpdateMessage={onUpdateMessage} onToggleReaction={onToggleReaction} />
        ))}
        <div ref={endOfMessagesRef} />
      </main>

      {/* Message Input Container */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto z-20 px-4">
        {imagePreviewUrl && !isGenerating && (
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
        <div className="relative flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isGenerating}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 size-11 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                aria-label="Upload image"
                disabled={isGenerating}
            >
                <span className="material-symbols-outlined">add_photo_alternate</span>
            </button>
            <input 
                type="text" 
                placeholder={isGenerating ? "Processing image..." : "type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                className="w-full pl-5 pr-14 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-700"
                disabled={isGenerating}
            />
            <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center disabled:bg-primary/70"
                aria-label="Send message"
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                ) : (
                    <span className="material-symbols-outlined">send</span>
                )}
            </button>
        </div>
        {isGenerating && (
            <p className="text-center text-xs text-gray-500 mt-1.5 animate-pulse">
                Generating caption & saving to scrapbook...
            </p>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-40 right-4 z-20">
        <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center justify-center size-14 rounded-full bg-accent text-white shadow-lg transform transition-transform hover:scale-105">
            <span className="material-symbols-outlined">person_add</span>
        </button>
      </div>
      
      {isInviteModalOpen && <InviteModal onClose={() => setIsInviteModalOpen(false)} onInvite={onInviteMember} />}
      {selectedMember && <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
};

export default Family;
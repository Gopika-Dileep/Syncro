import React, { useState, useRef, useEffect } from 'react';
import { Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MentionUser {
    _id: string;
    name: string;
    designation?: string;
}

interface MentionTextAreaProps {
    value: string;
    onChange: (text: string, mentions: string[]) => void;
    placeholder?: string;
    users: MentionUser[];
    className?: string;
}

const MentionTextArea: React.FC<MentionTextAreaProps> = ({
    value,
    onChange,
    placeholder,
    users,
    className
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    const extractMentions = (text: string): string[] => {
        // STRICT REGEX: Must be exactly 24 hex characters in brackets followed by (name)
        const mentionRegex = /@\[([a-f\d]{24})\]\(([^)]+)\)/g;
        const mentions: string[] = [];
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        return Array.from(new Set(mentions));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        // --- PREVENT ID CORRUPTION ---
        // If the user managed to type inside a @[...] block, it would break the 24-char count
        // The regex in extractMentions will naturally ignore broken IDs.
        
        const lastAtIndex = newValue.lastIndexOf('@', cursorPos - 1);
        
        if (lastAtIndex !== -1) {
            const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
            if (charBeforeAt === ' ' || charBeforeAt === '\n') {
                const textAfterAt = newValue.substring(lastAtIndex + 1, cursorPos);
                if (!textAfterAt.includes(' ')) {
                    setQuery(textAfterAt);
                    setShowSuggestions(true);
                    updateCoords();
                } else {
                    setShowSuggestions(false);
                }
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
        
        onChange(newValue, extractMentions(newValue));
    };

    const updateCoords = () => {
        if (!textareaRef.current) return;
        
        const { selectionStart } = textareaRef.current;
        const textBeforeCursor = textareaRef.current.value.substring(0, selectionStart);
        const lines = textBeforeCursor.split('\n');
        const lineCount = lines.length;
        const lastLineLength = lines[lineCount - 1].length;
        
        const textareaHeight = textareaRef.current.offsetHeight;
        const currentLineTop = lineCount * 22; 
        
        const showAbove = currentLineTop > textareaHeight - 80;

        setCoords({
            top: showAbove ? currentLineTop - 210 : currentLineTop + 25,
            left: Math.min(lastLineLength * 8, 150)
        });
    };

    const handleSelectUser = (user: MentionUser) => {
        if (!textareaRef.current) return;
        
        const cursorPos = textareaRef.current.selectionStart;
        const lastAtIndex = value.lastIndexOf('@', cursorPos - 1);
        
        const before = value.substring(0, lastAtIndex);
        const after = value.substring(cursorPos);
        
        // Ensure only ONE space at the end
        const mentionText = `@[${user._id}](${user.name}) `;
        const newValue = (before + mentionText + after.trimStart());
        
        onChange(newValue, extractMentions(newValue));
        setShowSuggestions(false);
        setQuery('');
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newPos = lastAtIndex + mentionText.length;
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (suggestions[selectedIndex]) {
                    e.preventDefault();
                    handleSelectUser(suggestions[selectedIndex]);
                    return;
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
                return;
            }
        }

        // --- SMART ATOMIC DELETION ---
        if (e.key === 'Backspace' && textareaRef.current) {
            const pos = textareaRef.current.selectionStart;
            const text = value;
            
            // Check if we are right after a mention: @[id](name) 
            if (text[pos - 1] === ' ' && text[pos - 2] === ')') {
                const lastOpenParen = text.lastIndexOf('(', pos - 2);
                const lastCloseBracket = text.lastIndexOf(']', lastOpenParen);
                const lastOpenBracket = text.lastIndexOf('@[', lastCloseBracket);
                
                if (lastOpenBracket !== -1 && lastOpenBracket < lastOpenParen) {
                    e.preventDefault();
                    const newValue = text.substring(0, lastOpenBracket) + text.substring(pos);
                    onChange(newValue, extractMentions(newValue));
                    
                    setTimeout(() => {
                        if (textareaRef.current) {
                            textareaRef.current.setSelectionRange(lastOpenBracket, lastOpenBracket);
                        }
                    }, 0);
                }
            }
        }
    };

    useEffect(() => {
        if (showSuggestions) {
            const filtered = users.filter(u => 
                u.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setSelectedIndex(0);
            if (filtered.length === 0) setShowSuggestions(false);
        }
    }, [query, showSuggestions, users]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleScroll = () => {
        if (textareaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const renderHighlighting = (text: string) => {
        if (!text) return null;

        const mentionRegex = /@\[([a-f\d]{24})\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
            }

            const userName = match[2];
            parts.push(
                <span 
                    key={`mention-${match.index}`}
                    className="inline-block px-1.5 py-0 bg-[#fa8029]/15 text-[#fa8029] font-bold rounded border border-[#fa8029]/30"
                >
                    @{userName}
                </span>
            );

            lastIndex = mentionRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
        }

        return parts;
    };

    return (
        <div className={cn(
            "relative w-full group rounded-2xl border border-gray-200 bg-white transition-all focus-within:border-[#fa8029]/30 focus-within:ring-2 focus-within:ring-[#fa8029]/5", 
            className
        )}>
            <div 
                ref={backdropRef}
                className="absolute inset-0 p-4 text-[14px] leading-relaxed whitespace-pre-wrap break-words pointer-events-none border border-transparent select-none overflow-hidden text-gray-700"
                style={{ fontFamily: 'inherit' }}
            >
                {renderHighlighting(value)}
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                placeholder={placeholder}
                className="w-full min-h-[100px] p-4 bg-transparent text-[14px] leading-relaxed outline-none transition-all resize-none custom-scrollbar relative z-10 caret-[#fa8029]"
                style={{ WebkitTextFillColor: 'transparent' }}
            />
            
            {showSuggestions && suggestions.length > 0 && (
                <div 
                    ref={suggestionsRef}
                    className="absolute z-[5000] w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{ 
                        top: `${coords.top}px`, 
                        left: `${coords.left}px` 
                    }}
                >
                    <div className="p-3 border-b border-gray-50 bg-[#fff9f5] flex items-center gap-2">
                        <Users size={14} className="text-[#fa8029]" />
                        <span className="text-[10px] font-black text-[#fa8029]/60 uppercase tracking-widest">Mention Team</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1.5 custom-scrollbar">
                        {suggestions.map((user, idx) => (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                className={cn(
                                    "px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-all rounded-xl mb-0.5",
                                    idx === selectedIndex ? "bg-[#fa8029] text-white shadow-md shadow-[#fa8029]/20 scale-[1.02]" : "hover:bg-gray-50 text-gray-700"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border",
                                    idx === selectedIndex ? "bg-white/20 border-white/20 text-white" : "bg-[#fa8029]/10 border-[#fa8029]/10 text-[#fa8029]"
                                )}>
                                    {user.name[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[13px] font-bold truncate">
                                        {user.name}
                                    </span>
                                    {user.designation && (
                                        <span className={cn(
                                            "text-[9px] uppercase font-bold tracking-tighter opacity-70 truncate",
                                            idx === selectedIndex ? "text-white" : "text-gray-400"
                                        )}>
                                            {user.designation}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ddd; }
            `}</style>
        </div>
    );
};

export default MentionTextArea;

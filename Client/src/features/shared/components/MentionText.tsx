import React from 'react';

interface MentionTextProps {
    text: string;
    className?: string;
    mentionClassName?: string;
}

/**
 * Renders text with highlighted @mentions.
 * Pattern: @[userId](userName)
 */
const MentionText: React.FC<MentionTextProps> = ({ 
    text, 
    className = "", 
    mentionClassName = "" 
}) => {
    if (!text) return null;

    // Regex to match @[id](name)
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        const userId = match[1];
        const userName = match[2];

        // Push the highlighted mention
        parts.push(
            <span 
                key={`${userId}-${match.index}`}
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#fff5ef] text-[#fa8029] font-bold text-[0.95em] border border-[#fa8029]/10 cursor-pointer hover:bg-[#fa8029] hover:text-white transition-all ${mentionClassName}`}
                title={`User ID: ${userId}`}
            >
                @{userName}
            </span>
        );

        lastIndex = mentionRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return (
        <span className={`whitespace-pre-wrap break-words leading-relaxed ${className}`}>
            {parts.length > 0 ? parts : text}
        </span>
    );
};

export default MentionText;

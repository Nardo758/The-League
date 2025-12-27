'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface User {
  id: number;
  full_name: string | null;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

const mentionCache = new Map<number, string>();

export function populateMentionCache(users: Array<{ id: number; full_name: string | null }>) {
  users.forEach(user => {
    if (user.full_name) {
      mentionCache.set(user.id, user.full_name);
    }
  });
}

export function extractMentionIds(text: string): number[] {
  const regex = /@\[user:(\d+)\]/g;
  const ids: number[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    ids.push(parseInt(match[1]));
  }
  return ids;
}

export function parseMentionsForDisplay(text: string): string {
  return text.replace(/@\[user:(\d+)\]/g, (match, userId) => {
    const cachedName = mentionCache.get(parseInt(userId));
    return cachedName ? `@${cachedName}` : `@user`;
  });
}

export function renderTextWithMentions(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /@\[user:(\d+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const userId = parseInt(match[1]);
    const displayName = mentionCache.get(userId) || 'user';
    parts.push(
      <span key={match.index} className="text-emerald-400 font-medium">
        @{displayName}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function MentionInput({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  rows = 3
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 1) {
      setUsers([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        searchUsers(searchQuery);
      }, 200);
      return () => clearTimeout(debounce);
    } else {
      setUsers([]);
    }
  }, [searchQuery, searchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const hasSpaceAfterAt = /\s/.test(textAfterAt);
      const isStartOfWord = lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]);
      
      if (!hasSpaceAfterAt && isStartOfWord) {
        setMentionStartPos(lastAtIndex);
        setSearchQuery(textAfterAt);
        setShowDropdown(true);
        return;
      }
    }
    
    setShowDropdown(false);
    setSearchQuery('');
    setMentionStartPos(null);
  };

  const insertMention = (user: User) => {
    if (mentionStartPos === null) return;
    
    const beforeMention = value.slice(0, mentionStartPos);
    const afterMention = value.slice(mentionStartPos + searchQuery.length + 1);
    const mentionToken = `@[user:${user.id}]`;
    
    mentionCache.set(user.id, user.full_name || 'User');
    
    const newValue = beforeMention + mentionToken + ' ' + afterMention;
    onChange(newValue);
    
    setShowDropdown(false);
    setSearchQuery('');
    setMentionStartPos(null);
    setUsers([]);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mentionToken.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || users.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
        e.preventDefault();
        insertMention(users[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSearchQuery('');
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderDisplayValue = () => {
    return value.replace(/@\[user:(\d+)\]/g, (match, userId) => {
      return `@User${userId}`;
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors resize-none ${className}`}
      />
      
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden"
        >
          {loading ? (
            <div className="px-4 py-3 text-gray-400 text-sm">Searching...</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              {searchQuery ? 'No users found' : 'Type to search users'}
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                    index === selectedIndex
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'hover:bg-[#2a2a2a] text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 text-sm font-medium">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">
                    {user.full_name || 'Anonymous User'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

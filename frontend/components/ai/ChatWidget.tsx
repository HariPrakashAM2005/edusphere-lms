'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Paperclip, Smile, Sparkles, FileText, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAttachment?: boolean;
  fileName?: string;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am Antigravity, your EduSphere AI learning tutor. Ask me about your courses, attendance requirements, or coding concepts!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How is my attendance rate?',
    'When is the sorting exam?',
    'Explain React state Hooks'
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Extract courseId from current path if in course page
  const getCourseIdFromPath = (): string | null => {
    if (pathname.includes('/courses/')) {
      const parts = pathname.split('/');
      const index = parts.indexOf('courses');
      if (index !== -1 && parts[index + 1]) {
        return parts[index + 1];
      }
    }
    return null;
  };

  const handleSendMessage = async (textToSend: string, isFile = false, fileName?: string) => {
    if (!textToSend.trim() && !isFile) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      isAttachment: isFile,
      fileName
    };

    setMessages(prev => [...prev, userMsg]);
    if (!isFile) setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    const courseId = getCourseIdFromPath();

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        courseId
      });

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toISOString()
        }
      ]);
      if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I am facing connection issues. Please try querying again.",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  // Mock file selector trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      handleSendMessage(`[File Attachment] Reference document: ${file.name}`, true, file.name);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating button toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:scale-105 transition-all duration-300 relative group"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xxs font-bold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Ask Antigravity AI Tutor
          </span>
        </button>
      )}

      {/* Expandable chat window (glassmorphic layout) */}
      {isOpen && (
        <div className="w-[340px] h-[480px] bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-scaleUp">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-650 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-xl">
                <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-wide">Antigravity AI</h4>
                <p className="text-xxs text-blue-200 font-semibold mt-0.5">LMS Academic Companion</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/20">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}>
                    {msg.isAttachment ? (
                      <div className="flex items-center gap-2 text-xxs font-mono bg-blue-700/40 p-2 rounded-lg text-blue-100">
                        <FileText className="h-4.5 w-4.5 shrink-0" />
                        <span className="truncate max-w-[150px]">{msg.fileName}</span>
                      </div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl rounded-bl-none p-3 flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions bubbles */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 border-t border-gray-100 dark:border-gray-850 bg-white dark:bg-gray-900 select-none no-scrollbar">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-750 text-gray-500 dark:text-gray-400 rounded-full text-xxs font-bold whitespace-nowrap transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2 shrink-0">
            {/* Mock file selector wrapper */}
            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 transition cursor-pointer shrink-0">
              <Paperclip className="h-4.5 w-4.5" />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
              />
            </label>

            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              className="flex-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl px-3.5 py-2 outline-none text-xs transition"
            />

            <button
              onClick={() => handleSendMessage(input)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shrink-0 shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

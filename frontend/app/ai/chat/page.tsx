'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useCourses } from '../../../hooks/useDashboard';
import { useSendMessage } from '../../../hooks/useAI';
import MarkdownRenderer from '../../../components/ai/MarkdownRenderer';
import {
  Sparkles,
  Send,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Info,
  Clock,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  helpful?: boolean;
}

export default function AIChatWorkspacePage() {
  const { data: courses } = useCourses();
  const sendMessageMutation = useSendMessage();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatHistoryItem[]>([
    {
      role: 'assistant',
      content: "Welcome to the full AI Chat Workspace! Select a course context from the header to ask specific curriculum questions, or ask general LMS inquiries.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [rateLimitCount, setRateLimitCount] = useState(50);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessageMutation.isPending]);

  const handleSend = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userText = input;
    setInput('');
    
    // Add user message to screen
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userText, timestamp: new Date().toISOString() }
    ]);

    sendMessageMutation.mutate(
      {
        message: userText,
        courseId: selectedCourseId === 'general' ? null : selectedCourseId
      },
      {
        onSuccess: (data) => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: data.reply,
              timestamp: new Date().toISOString()
            }
          ]);
          setRateLimitCount(prev => Math.max(prev - 1, 0));
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: "I'm sorry, I encountered an issue processing that query. Please try again.",
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
    );
  };

  const handleFeedback = (index: number, helpful: boolean) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        helpful
      };
      return updated;
    });
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
        
        {/* Left Col: Conversation direct info card (ColSpan 1) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">AI Workspace</h3>
                <p className="text-xxs text-gray-450 dark:text-gray-500 font-semibold mt-0.5">GPT-4o Powered Tutor</p>
              </div>
            </div>

            <p className="text-xxs text-gray-500 dark:text-gray-400 leading-relaxed">
              Use this workspace to query advanced algorithms, ask syntax bugs in Python/JS, explain complex topics, or retrieve syllabus scopes.
            </p>

            {/* Context select */}
            <div className="pt-2">
              <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Context</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold appearance-none cursor-pointer"
              >
                <option value="general">General (All Subjects)</option>
                {courses?.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rate limits warning */}
          <div className={`p-4 rounded-2xl border flex gap-2.5 items-start transition duration-150 ${
            rateLimitCount < 10
              ? 'bg-red-50 dark:bg-red-950/20 border-red-250 text-red-700'
              : 'bg-gray-55/40 dark:bg-gray-850 border-gray-150 dark:border-gray-800 text-gray-500'
          }`}>
            {rateLimitCount < 10 ? (
              <AlertCircle className="h-5.5 w-5.5 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-5.5 w-5.5 text-gray-450 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="text-xxs font-extrabold text-gray-800 dark:text-gray-200">Rate Limiting Check</p>
              <p className="text-[10px] leading-relaxed">
                {rateLimitCount} / 50 requests remaining this hour. Rate resets every 60 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Chat dialog interface (ColSpan 3) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-850 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs md:text-sm font-bold text-gray-805 dark:text-white">Active Dialogue Console</h3>
            </div>
            
            <span className="text-xxs font-bold px-2.5 py-0.5 bg-gray-50 dark:bg-gray-850 text-gray-450 border border-gray-200 dark:border-gray-800 rounded-full uppercase tracking-wider">
              Context: {selectedCourseId === 'general' ? 'General' : courses?.find(c => c.courseId === selectedCourseId)?.title}
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50 dark:bg-gray-950/20 select-text">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className="max-w-[85%] space-y-1.5 flex flex-col items-end">
                    
                    <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm w-full ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap font-semibold select-text">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>

                    {/* Feedback Rating (only for AI replies) */}
                    {!isUser && (
                      <div className="flex gap-1 items-center self-start px-1 select-none">
                        <button
                          onClick={() => handleFeedback(idx, true)}
                          className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                            msg.helpful === true ? 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25' : 'text-gray-400'
                          }`}
                          title="Helpful reply"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, false)}
                          className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                            msg.helpful === false ? 'text-red-500 bg-red-50/50 dark:bg-red-950/25' : 'text-gray-400'
                          }`}
                          title="Not helpful reply"
                        >
                          <ThumbsDown className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl rounded-bl-none p-3.5 flex gap-1 items-center">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 shrink-0">
            <input
              type="text"
              placeholder="Query coding syntax, attendance checks, or complexity bounds..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sendMessageMutation.isPending}
              className="flex-1 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-xs md:text-sm transition disabled:opacity-80"
            />
            <button
              onClick={handleSend}
              disabled={sendMessageMutation.isPending}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shrink-0 shadow-md flex items-center gap-1.5 text-xs font-bold disabled:opacity-85"
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

'use client';

import React from 'react';

interface QuestionPaletteProps {
  questions: { id: string; order: number }[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  markedForReview: string[];
  visitedQuestions: string[];
  onSelectQuestion: (index: number) => void;
}

export default function QuestionPalette({
  questions,
  currentQuestionIndex,
  answers,
  markedForReview,
  visitedQuestions,
  onSelectQuestion
}: QuestionPaletteProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Question Navigator</h3>
      
      {/* Grid numbers */}
      <div className="grid grid-cols-5 gap-2.5">
        {questions.map((question, idx) => {
          const isCurrent = idx === currentQuestionIndex;
          const isAnswered = answers[question.id] && answers[question.id].trim() !== '';
          const isMarked = markedForReview.includes(question.id);
          const isVisited = visitedQuestions.includes(question.id);

          let bgStyle = 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400';
          
          if (isVisited && !isAnswered && !isMarked) {
            bgStyle = 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200';
          }
          if (isAnswered) {
            bgStyle = 'bg-emerald-500 border-emerald-600 text-white';
          }
          if (isMarked) {
            bgStyle = 'bg-amber-500 border-amber-600 text-white';
          }
          if (isCurrent) {
            bgStyle += ' ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900';
          }

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(idx)}
              className={`aspect-square rounded-xl border flex items-center justify-center font-bold text-xs transition duration-150 hover:scale-105 active:scale-95 ${bgStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Status Legend indicators */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-850 grid grid-cols-2 gap-2 text-xxs font-bold uppercase tracking-wider text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-emerald-500" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-amber-500" />
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800" />
          <span>Unvisited</span>
        </div>
      </div>

    </div>
  );
}

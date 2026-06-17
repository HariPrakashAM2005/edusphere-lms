'use client';

import React from 'react';
import { Check, X, Info } from 'lucide-react';

interface MCQQuestionProps {
  question: {
    id: string;
    text: string;
    type: string; // 'mcq' (single) or multi-select (which we can support via option layout)
    options: any; // string array or stringified json
    marks: number;
    correctAnswer?: string;
    explanation?: string;
  };
  selectedAnswer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrectFeedback?: boolean;
}

export default function MCQQuestion({
  question,
  selectedAnswer,
  onChange,
  disabled = false,
  showFeedback = false,
  isCorrectFeedback
}: MCQQuestionProps) {
  // Parse options list
  let optionsList: string[] = [];
  try {
    optionsList = typeof question.options === 'string' 
      ? JSON.parse(question.options) 
      : (Array.isArray(question.options) ? question.options : []);
  } catch (err) {
    optionsList = [];
  }

  // Support both single select and multi-select checkbox styles
  const isMultiSelect = question.text.toLowerCase().includes('select all') || question.type === 'multiselect';

  const handleOptionClick = (option: string) => {
    if (disabled) return;

    if (isMultiSelect) {
      // Toggle option in comma-separated list
      const currentSelections = selectedAnswer ? selectedAnswer.split(',').map(s => s.trim()) : [];
      let updated;
      if (currentSelections.includes(option)) {
        updated = currentSelections.filter(s => s !== option);
      } else {
        updated = [...currentSelections, option];
      }
      onChange(updated.join(', '));
    } else {
      onChange(option);
    }
  };

  const isSelected = (option: string) => {
    if (isMultiSelect) {
      return selectedAnswer.split(',').map(s => s.trim()).includes(option);
    }
    return selectedAnswer === option;
  };

  return (
    <div className="space-y-4">
      
      {/* Question Text */}
      <div className="flex justify-between items-start gap-4">
        <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-relaxed">
          {question.text}
        </h4>
        <span className="text-xxs font-extrabold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full shrink-0">
          {question.marks} Marks
        </span>
      </div>

      {isMultiSelect && (
        <p className="text-xxs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          * Multiple selection enabled
        </p>
      )}

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3.5 mt-4">
        {optionsList.map((option, idx) => {
          const selected = isSelected(option);
          const isCorrectAnswerOption = question.correctAnswer && option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
          
          let optionStyle = 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900';
          
          if (selected) {
            optionStyle = 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500';
          }

          if (showFeedback) {
            if (isCorrectAnswerOption) {
              optionStyle = 'border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 ring-1 ring-emerald-500';
            } else if (selected && !isCorrectAnswerOption) {
              optionStyle = 'border-red-500 bg-red-50/15 dark:bg-red-950/20 ring-1 ring-red-500';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-semibold transition flex items-center justify-between gap-4 group ${optionStyle} ${
                disabled ? 'cursor-not-allowed opacity-85' : 'cursor-pointer hover:scale-[1.005]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Selector visual indicator */}
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                  selected 
                    ? 'border-blue-500 bg-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-700 group-hover:border-gray-400'
                }`}>
                  {selected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-gray-800 dark:text-gray-200 leading-normal">{option}</span>
              </div>

              {/* Correct / Incorrect icons on feedback mode */}
              {showFeedback && (
                <div className="shrink-0">
                  {isCorrectAnswerOption && (
                    <Check className="h-5 w-5 text-emerald-500" />
                  )}
                  {selected && !isCorrectAnswerOption && (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback panel */}
      {showFeedback && (
        <div className={`mt-6 p-4 rounded-xl border ${
          isCorrectFeedback 
            ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 text-emerald-805 dark:text-emerald-300' 
            : 'bg-red-50/20 dark:bg-red-950/10 border-red-200 dark:border-red-900/40 text-red-805 dark:text-red-300'
        }`}>
          <div className="flex items-start gap-2.5">
            <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">
                {isCorrectFeedback ? 'Answer is Correct!' : 'Answer is Incorrect'}
              </p>
              {question.correctAnswer && (
                <p className="text-xxs font-semibold opacity-90">
                  Correct Answer: <span className="font-bold underline">{question.correctAnswer}</span>
                </p>
              )}
              {question.explanation && (
                <p className="text-xxs leading-relaxed mt-1 opacity-85">
                  <span className="font-bold">Explanation:</span> {question.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

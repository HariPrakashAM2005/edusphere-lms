'use client';

import React, { useState } from 'react';
import { Play, Code, CheckCircle, XCircle, Terminal } from 'lucide-react';

interface CodingQuestionProps {
  question: {
    id: string;
    text: string;
    marks: number;
    correctAnswer?: string; // Expected stdout
    explanation?: string;
  };
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export default function CodingQuestion({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false
}: CodingQuestionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState<boolean | null>(null);

  // Default templates for languages
  const codeTemplates: Record<string, string> = {
    python: `def solve():\n    # Write your solution here\n    pass\n\nsolve()`,
    javascript: `function solve() {\n    // Write your solution here\n}\n\nsolve();`,
    java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (!value || value.trim() === '' || Object.values(codeTemplates).includes(value)) {
      onChange(codeTemplates[lang]);
    }
  };

  // Enforce initial code template if empty
  React.useEffect(() => {
    if (!value || value.trim() === '') {
      onChange(codeTemplates.python);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      
      // Reset cursor pos after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput(null);
    setRunSuccess(null);

    // Mock compilation run (matches keywords and stdout checks)
    setTimeout(() => {
      setIsRunning(false);
      const expectedStdout = question.correctAnswer || '';
      
      if (value.toLowerCase().includes('error') || value.toLowerCase().includes('syntaxerror')) {
        setConsoleOutput('Compilation Error:\n  File "solution.py", line 4\n    indents do not match expectation\nIndentationError: unexpected indent');
        setRunSuccess(false);
      } else {
        const output = expectedStdout ? expectedStdout : 'Done. Assertions completed.';
        setConsoleOutput(`Running tests...\n\nStdout:\n${output}\n\nAll sample test cases passed!`);
        setRunSuccess(true);
      }
    }, 1500);
  };

  // Generate line numbers column
  const lineNumbers = value ? value.split('\n').map((_, i) => i + 1) : [1];

  return (
    <div className="space-y-4">
      
      {/* Header details */}
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-150 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs font-bold">
          <Code className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
          <span>Editor Console</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            disabled={disabled}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none transition text-xxs font-bold appearance-none cursor-pointer pr-8 relative"
          >
            <option value="python">Python 3.10</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="java">Java 17 (OpenJDK)</option>
            <option value="cpp">C++ 20 (GCC)</option>
          </select>
        </div>
      </div>

      {/* Editor & Line numbers track */}
      <div className="flex border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-950 text-gray-300 font-mono text-xs md:text-sm relative h-[280px]">
        {/* Line numbers column */}
        <div className="w-10 bg-gray-900 border-r border-gray-800 py-4 text-right pr-2 select-none text-gray-650 flex flex-col font-bold">
          {lineNumbers.map((line) => (
            <span key={line} className="h-[21px]">{line}</span>
          ))}
        </div>

        {/* Textarea code container */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          className="flex-1 bg-transparent py-4 px-3 outline-none resize-none leading-[21px] font-mono h-full w-full select-text"
          placeholder="# Type solution here..."
        />
      </div>

      {/* Actions */}
      {!disabled && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-250 font-bold rounded-lg transition text-xxs"
          >
            <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
            {isRunning ? 'Running tests...' : 'Run sample tests'}
          </button>
        </div>
      )}

      {/* Compiler Output Screen */}
      {consoleOutput && (
        <div className="p-4 bg-gray-950 text-gray-300 border border-gray-800 rounded-xl font-mono text-xxs leading-relaxed">
          <div className="flex items-center gap-1.5 mb-2 font-bold uppercase tracking-wider text-gray-550 border-b border-gray-850 pb-2">
            <Terminal className="h-4 w-4" />
            <span>Standard Out / Terminal</span>
          </div>
          <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
        </div>
      )}

      {/* Post-submission evaluation details */}
      {showFeedback && (
        <div className="mt-6 p-4 rounded-xl border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/50 text-xs text-gray-750 dark:text-gray-300 space-y-3">
          <h4 className="font-bold flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
            Grading Reference Details
          </h4>
          <div className="space-y-1 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 p-3.5 rounded-xl font-mono text-xxs">
            <p className="font-bold text-gray-400">Expected Outputs:</p>
            <pre className="mt-1 text-blue-600 dark:text-blue-400 whitespace-pre-wrap">{question.correctAnswer || 'Empty assert (manual verification)'}</pre>
          </div>
          {question.explanation && (
            <p className="text-xxs leading-relaxed text-gray-500 mt-2">
              <span className="font-bold">Explanation:</span> {question.explanation}
            </p>
          )}
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!content) return null;

  // Simple and robust Markdown parser using regex and splits
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';
    
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    lines.forEach((line, idx) => {
      // 1. Code Block starts/ends
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          const codeString = codeContent.join('\n');
          const currentLang = codeLanguage;
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl border border-gray-800 overflow-hidden bg-gray-950 text-gray-250 font-mono text-xxs leading-relaxed w-full">
              <div className="flex justify-between items-center bg-gray-900 px-4 py-2 border-b border-gray-850 select-none">
                <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">{currentLang || 'code'}</span>
                <button
                  onClick={() => handleCopy(codeString)}
                  className="flex items-center text-gray-500 hover:text-white transition font-bold"
                >
                  {copiedText === codeString ? (
                    <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedText === codeString ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed select-text">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeContent = [];
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          // Start of code block
          codeLanguage = line.trim().slice(3).trim();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // 2. Table parsing
      if (line.trim().startsWith('|')) {
        inTable = true;
        const columns = line.split('|').map(col => col.trim()).filter((_, colIdx, array) => colIdx > 0 && colIdx < array.length - 1);
        
        // Skip separator line (e.g. |---|---|)
        if (columns.every(col => col.startsWith('-') || col.includes('---'))) {
          return;
        }

        if (tableHeaders.length === 0) {
          tableHeaders = columns;
        } else {
          tableRows.push(columns);
        }
        return;
      } else if (inTable) {
        // Table ended
        elements.push(
          <div key={`table-${idx}`} className="my-3 overflow-x-auto w-full border border-gray-150 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xxs md:text-xs">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 text-gray-550 font-extrabold uppercase">
                  {tableHeaders.map((header, hIdx) => (
                    <th key={hIdx} className="p-3 font-bold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50/30 dark:hover:bg-gray-850/10">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 font-semibold text-gray-700 dark:text-gray-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }

      // 3. Bullet list parsing
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const text = line.trim().slice(2);
        elements.push(
          <li key={`list-${idx}`} className="ml-4 list-disc text-xxs md:text-xs font-semibold leading-relaxed my-1 select-text">
            {inlineFormatting(text)}
          </li>
        );
        return;
      }

      // 4. Headers parsing
      if (line.trim().startsWith('### ')) {
        elements.push(
          <h4 key={`h4-${idx}`} className="text-xs md:text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mt-4 mb-2 select-text">
            {inlineFormatting(line.trim().slice(4))}
          </h4>
        );
        return;
      }
      if (line.trim().startsWith('## ')) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white mt-4 mb-2 select-text">
            {inlineFormatting(line.trim().slice(3))}
          </h3>
        );
        return;
      }

      // 5. Normal text paragraphs
      if (line.trim() !== '') {
        elements.push(
          <p key={`p-${idx}`} className="text-xxs md:text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed my-2 select-text">
            {inlineFormatting(line)}
          </p>
        );
      }
    });

    return elements;
  };

  // Inline formatting helper (Bold, LaTeX notation fallback, inline code)
  const inlineFormatting = (text: string): React.ReactNode[] => {
    // Regex for bold (**text**)
    const parts: React.ReactNode[] = [];
    let currentText = text;

    // LaTeX inline substitution (e.g. replace $O(n \log n)$ or $O(n^2)$)
    currentText = currentText.replace(/\$(.*?)\$/g, '`$1`');

    const regex = /(\*\*|`)(.*?)\1/g;
    let match;
    let lastIndex = 0;
    let keyIdx = 0;

    while ((match = regex.exec(currentText)) !== null) {
      // Push text before match
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }

      const type = match[1];
      const matchText = match[2];

      if (type === '**') {
        parts.push(<strong key={`b-${keyIdx}`} className="font-extrabold text-gray-900 dark:text-white">{matchText}</strong>);
      } else {
        // Inline code or LaTeX equations
        parts.push(
          <code key={`code-${keyIdx}`} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-md font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
            {matchText}
          </code>
        );
      }
      
      keyIdx++;
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return <div className="space-y-1 w-full select-text">{parseMarkdown(content)}</div>;
}

import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface GeneratedQuestion {
  text: string;
  type: 'mcq' | 'truefalse' | 'fillblank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: number;
}

// Mock database fallback generators
const MOCK_GENERATED_QUIZ: GeneratedQuestion[] = [
  { text: 'What is the runtime of Merge Sort in the average case?', type: 'mcq', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'], correctAnswer: 'O(n log n)', explanation: 'Merge sort splits the array recursively (log n levels) and merges them at each level (O(n) work), yielding O(n log n).', marks: 5, difficulty: 2 },
  { text: 'Does Quick Sort operate in-place, modifying the original array structure?', type: 'truefalse', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Yes, Quick sort partitions elements in place around a chosen pivot, avoiding supplementary allocations.', marks: 3, difficulty: 3 },
  { text: 'Which data structure is typically used to implement Breadth-First Search (BFS)?', type: 'fillblank', correctAnswer: 'Queue', explanation: 'BFS explores neighbor vertices level-by-level, utilizing a FIFO Queue to track traversal state.', marks: 4, difficulty: 2 }
];

const MOCK_FLASHCARDS = [
  { front: 'JSX', back: 'JavaScript Syntax Extension. It allows writing HTML structures directly in React scripts.' },
  { front: 'Props', back: 'Read-only properties passed down from parent components to customize child rendering.' },
  { front: 'State', back: 'Internal component variables that hold stateful values. Modifying state triggers React renders.' }
];

// 1. generateQuizFromPDF (OpenAI with rule-based fallback)
export const generateQuizFromPDF = async (
  pdfText: string,
  questionCount: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  createdBy: string
): Promise<GeneratedQuestion[]> => {
  
  if (OPENAI_API_KEY) {
    try {
      const systemPrompt = `You are a curriculum compiler. Output a JSON array of quiz questions based on the provided text.
      The output must strictly be a raw JSON array matching this typescript interface:
      interface GeneratedQuestion {
        text: string;
        type: 'mcq' | 'truefalse' | 'fillblank';
        options?: string[]; // exactly 4 options for MCQ, empty otherwise
        correctAnswer: string; // text match
        explanation: string;
        marks: number;
        difficulty: number; // 1 to 5
      }
      Generate exactly ${questionCount} questions. Difficulty target is ${difficulty}.`;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Text to analyze:\n\n${pdfText}` }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const jsonResponse = JSON.parse(response.data.choices[0].message.content);
      // Extract array (in case assistant wrapped it in an object key)
      const list = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.questions || Object.values(jsonResponse)[0]);

      if (Array.isArray(list)) {
        // Log in database
        await prisma.aIGeneratedContent.create({
          data: {
            type: 'quiz',
            sourceId: 'pdf-upload',
            content: list as any,
            createdBy
          }
        });
        return list as GeneratedQuestion[];
      }
    } catch (err: any) {
      console.warn('⚠️ OpenAI Quiz generation failed, defaulting to local content simulator.', err.message);
    }
  }

  // Fallback Rule-based quiz simulator
  let finalQuiz = [...MOCK_GENERATED_QUIZ];
  
  // Customize mock text based on text match keywords
  const cleanText = pdfText.toLowerCase();
  if (cleanText.includes('react') || cleanText.includes('component')) {
    finalQuiz = [
      { text: 'Which React hook is used to perform side-effects in functional components?', type: 'mcq', options: ['useState', 'useEffect', 'useContext', 'useRef'], correctAnswer: 'useEffect', explanation: 'useEffect registers side-effects (e.g. data fetching, subscription logs) that sync with DOM states.', marks: 5, difficulty: 2 },
      { text: 'In React, components can directly modify their received props.', type: 'truefalse', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Props are strictly immutable. Modify state variables to trigger internal renders instead.', marks: 3, difficulty: 1 },
      { text: 'What function is used to declare state variables in React?', type: 'fillblank', correctAnswer: 'useState', explanation: 'useState declares a state variable and returns its setter modifier.', marks: 4, difficulty: 2 }
    ];
  } else if (cleanText.includes('javascript') || cleanText.includes('variable')) {
    finalQuiz = [
      { text: 'Which keyword defines block-scoped local variables in modern JavaScript?', type: 'mcq', options: ['var', 'let', 'const', 'let and const'], correctAnswer: 'let and const', explanation: 'Both let and const bind variables locally inside code blocks, whereas var scopes globally/functionally.', marks: 5, difficulty: 2 },
      { text: 'Is null a primitive data type in JavaScript?', type: 'truefalse', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Yes, null represents the intentional absence of object values, classified as a primitive type.', marks: 3, difficulty: 1 },
      { text: 'What operator checks both value and type equality in JavaScript?', type: 'fillblank', correctAnswer: '===', explanation: 'The strict equality operator === checks values and data types without performing casting.', marks: 4, difficulty: 2 }
    ];
  }

  // Log in database
  try {
    await prisma.aIGeneratedContent.create({
      data: {
        type: 'quiz',
        sourceId: 'pdf-upload-mock',
        content: finalQuiz as any,
        createdBy
      }
    });
  } catch (dbErr) {
    // proceed
  }

  return finalQuiz;
};

// 2. summarizeTranscript (OpenAI with rule-based fallback)
export const summarizeTranscript = async (
  transcript: string,
  createdBy: string
): Promise<string> => {
  
  if (OPENAI_API_KEY) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an academic summarizer. Summarize the following lecture transcript into key takeaways and bullet point takeaways. Format in GitHub-style Markdown.' },
            { role: 'user', content: transcript }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.choices[0].message.content;
      await prisma.aIGeneratedContent.create({
        data: {
          type: 'summary',
          sourceId: 'lecture-transcript',
          content: { text: summary } as any,
          createdBy
        }
      });
      return summary;
    } catch (err: any) {
      console.warn('⚠️ OpenAI summary completion failed.', err.message);
    }
  }

  // Fallback summary
  const summaryText = `### Lecture Takeaway Summary\n\n* **Primary Subject**: Sorting complexity benchmarks and data traversal protocols.\n* **Key Concepts discussed**:\n  1. **Bubble Sort**: Simplest algorithm, operates via adjacent swap passes. Time complexity averages $O(n^2)$, making it inefficient for large lists.\n  2. **Merge Sort**: Uses a divide-and-conquer paradigm. Recursively partitions arrays into single elements and merges them in sorted order. Operational complexity is $O(n \\log n)$.\n  3. **Queue traversal**: Essential FIFO array queue mechanisms to map path distances sequentially in graphs.\n\n* **Action Item**: Complete the practice quiz generators and verify your attendance records on the scorecard dashboard.`;

  try {
    await prisma.aIGeneratedContent.create({
      data: {
        type: 'summary',
        sourceId: 'lecture-transcript-mock',
        content: { text: summaryText } as any,
        createdBy
      }
    });
  } catch (err) {
    // proceed
  }

  return summaryText;
};

// 3. generateAssignment
export const generateAssignment = (topic: string): string => {
  return `### Practice Assignment: ${topic}\n\n#### Directives:\n1. Implement a function to solve the core task.\n2. Add comments explaining your algorithm complexity.\n3. Verify your solutions against sample assertions.\n\n#### Problem Statement:\nWrite a script that accepts a list of integers and returns a sorted list containing only unique items. Optimize for $O(n \\log n)$ execution.\n\n\`\`\`python\ndef unique_sorted(lst):\n    # Write code here\n    pass\n\n# Assertions\nassert unique_sorted([3, 2, 2, 1]) == [1, 2, 3]\n\`\`\``;
};

// 4. generateFlashcards
export const generateFlashcards = (lessonContent: string): { front: string; back: string }[] => {
  const clean = lessonContent.toLowerCase();
  if (clean.includes('react') || clean.includes('state')) {
    return MOCK_FLASHCARDS;
  }
  return [
    { front: 'Big O Notation', back: 'Mathematical representation describing the upper bound execution time of an algorithm in the worst case.' },
    { front: 'Recursion', back: 'A programming technique where a function calls itself directly or indirectly to solve smaller subproblems.' },
    { front: 'Stack', back: 'A LIFO (Last-In-First-Out) abstract data type with push and pop operations.' }
  ];
};

// 5. explainConcept
export const explainConcept = (concept: string, style: string = 'simple'): string => {
  return `### Concept Explanation: ${concept} (${style} style)\n\nThink of **${concept}** like sorting books on a shelf. Instead of comparing all of them at once, you pick one book (the pivot) and arrange the others by whether they are taller or shorter. By repeating this process on the smaller sections, the entire shelf gets sorted naturally!\n\n**Key takeaways:**\n- Simple partitions speed up overall sorting.\n- Time complexity average is $O(n \\log n)$.`;
};

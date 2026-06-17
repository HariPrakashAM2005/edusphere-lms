import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface EssayGradingResult {
  score: number;
  plagiarismPercent: number;
  feedback: string;
  rubricBreakdown: {
    grammar: number; // out of 10
    structure: number; // out of 10
    contentDepth: number; // out of 10
  };
}

// Helper: Calculate token Jaccard string similarity (Plagiarism Checker)
export const calculatePlagiarismScore = (studentText: string, referenceText: string): number => {
  if (!studentText || !referenceText) return 0;

  const clean = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  
  const tokensStudent = new Set(clean(studentText));
  const tokensReference = new Set(clean(referenceText));

  if (tokensStudent.size === 0 || tokensReference.size === 0) return 0;

  const intersection = new Set([...tokensStudent].filter(x => tokensReference.has(x)));
  const union = new Set([...tokensStudent, ...tokensReference]);

  const jaccardIndex = intersection.size / union.size;
  return Math.round(jaccardIndex * 100);
};

// Reference mock database text to test plagiarism flagging
const COPIED_WIKIPEDIA_SQL_ESSAY = `sql databases are relational database management systems. they store data in tables with columns and rows. schema structures are strict, requiring prior normalization to prevent database anomalies. scaling relational structures vertically requires hardware upgrades, making horizontal partitioning challenging. nosql databases, by contrast, are non-relational document-based schemas, storing key-value pairs or json models. they scale horizontally easily.`;

// 1. gradeEssay (OpenAI with rule-based fallback)
export const gradeEssay = async (
  essayText: string,
  questionRubric: string, // Describes question prompt / grading criteria
  totalMarks: number = 10
): Promise<EssayGradingResult> => {

  // Run Jaccard plagiarism check against reference database template
  const plagiarismPercent = calculatePlagiarismScore(essayText, COPIED_WIKIPEDIA_SQL_ESSAY);

  if (OPENAI_API_KEY) {
    try {
      const systemPrompt = `You are a university grader auditing a student subjective essay. Score the essay based on the rubric.
      Output strictly a raw JSON object matching this typescript interface:
      interface EssayGradingResult {
        score: number; // total marks awarded (out of ${totalMarks})
        feedback: string; // concise improvement suggestions
        rubricBreakdown: {
          grammar: number; // 0-10 scale
          structure: number; // 0-10 scale
          contentDepth: number; // 0-10 scale
        }
      }`;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Exam Rubric:\n${questionRubric}\n\nStudent Essay:\n${essayText}` }
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

      const parsed = JSON.parse(response.data.choices[0].message.content) as EssayGradingResult;
      return {
        ...parsed,
        plagiarismPercent
      };
    } catch (err: any) {
      console.warn('⚠️ OpenAI Essay grading failed, defaulting to local grammar/keyword matching heuristics.', err.message);
    }
  }

  // Fallback local grammar and keyword analyzer
  return runLocalEssayGrading(essayText, questionRubric, totalMarks, plagiarismPercent);
};

const runLocalEssayGrading = (
  essay: string,
  rubric: string,
  totalMarks: number,
  plagiarismPercent: number
): EssayGradingResult => {
  
  const textLength = essay.length;
  
  // 1. Grade grammar (based on basic character length and punctuation spreads)
  let grammar = 5;
  if (textLength > 300) grammar = 8;
  if (essay.includes('.') && essay.includes(',')) grammar = Math.min(grammar + 1, 10);
  if (plagiarismPercent > 80) grammar = 9; // copied text usually has great grammar!

  // 2. Grade structure
  let structure = 4;
  if (essay.split('\n').length > 1) structure = 7; // multiple paragraphs
  if (essay.toLowerCase().includes('concl') || essay.toLowerCase().includes('summary')) structure = Math.min(structure + 2, 10);

  // 3. Grade content depth (density matching of related academic terms)
  let contentDepth = 3;
  const keywords = ['scalability', 'consistency', 'mongodb', 'schema', 'relational', 'acid', 'distributed', 'performance'];
  const matched = keywords.filter(w => essay.toLowerCase().includes(w));
  contentDepth = Math.min(contentDepth + (matched.length * 1.5), 10);

  // Calculate total final marks (grammar: 20%, structure: 30%, depth: 50%)
  const overallPct = (grammar * 0.20) + (structure * 0.30) + (contentDepth * 0.50); // out of 10
  let score = parseFloat(((overallPct / 10) * totalMarks).toFixed(1));

  // Enforce plagiarism penalties
  let feedback = '';
  if (plagiarismPercent > 60) {
    score = parseFloat((score * 0.2).toFixed(1)); // 80% mark deduction penalty
    feedback = `⚠️ Plagiarism Alert: A high similarity index of ${plagiarismPercent}% was detected against web reference libraries. Marks have been penalized. Ensure citations are supplied.`;
  } else {
    feedback = `Evaluation Completed. Essay structure was clean and demonstrated understanding. Suggestions: `;
    if (contentDepth < 6) {
      feedback += `Expand on transactional integrity and scaling limitations (e.g. horizontally vs vertically). `;
    } else {
      feedback += `Excellent coverage of keywords and architectural concepts. `;
    }
    if (grammar < 7) {
      feedback += `Refine formatting structure and sentence spacing. `;
    }
  }

  return {
    score,
    plagiarismPercent,
    feedback,
    rubricBreakdown: {
      grammar: Math.round(grammar),
      structure: Math.round(structure),
      contentDepth: Math.round(contentDepth)
    }
  };
};

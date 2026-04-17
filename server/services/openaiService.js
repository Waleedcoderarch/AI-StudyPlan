const OpenAI = require('openai');

let groqClient = null;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
  }

  return groqClient;
};

const normalizeProviderError = (error) => {
  const message = error?.message || 'AI request failed';
  const lower = message.toLowerCase();
  const normalized = new Error(message);

  if (lower.includes('quota') || lower.includes('429') || lower.includes('resource has been exhausted')) {
    normalized.code = 'insufficient_quota';
    normalized.message = 'Groq API quota exceeded. Please check your billing or usage limits.';
    return normalized;
  }

  if (lower.includes('api key not valid') || lower.includes('invalid api key') || lower.includes('permission denied')) {
    normalized.code = 'invalid_api_key';
    normalized.message = 'Invalid Groq API key. Please check your configuration.';
    return normalized;
  }

  return normalized;
};

const generateText = async (prompt, options = {}) => {
  try {
    const client = getGroqClient();
    const result = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxOutputTokens ?? 1500
    });

    return result.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    throw normalizeProviderError(error);
  }
};

/**
 * Answer a user question with conversation history context
 */
const answerQuestion = async (question, history = []) => {
  const systemPrompt = `You are an expert AI tutor and doubt solver. You help students understand complex topics clearly and concisely.
Guidelines:
- Give clear, structured answers
- Use examples when helpful
- Break down complex concepts step by step
- If a question is ambiguous, address the most likely interpretation
- Format mathematical expressions clearly
- Be encouraging and educational in tone`;

  const historyBlock = history.length
    ? history.map((h, index) => `Conversation ${index + 1}:\nUser: ${h.question}\nAssistant: ${h.answer}`).join('\n\n')
    : 'No prior conversation.';

  const prompt = `${systemPrompt}

Conversation history:
${historyBlock}

Current user question:
${question}

Answer the current question directly.`;

  return generateText(prompt, { temperature: 0.7, maxOutputTokens: 1500 });
};

/**
 * Generate structured notes from extracted PDF text
 */
const generateNotes = async (text, title = 'Document') => {
  // Truncate text if too long (keep within token limits)
  const truncatedText = text.length > 12000 ? text.substring(0, 12000) + '...[truncated]' : text;

  const prompt = `You are an expert note-taker and educator. Analyze the following text from "${title}" and create comprehensive, well-structured study notes.

Text to analyze:
"""
${truncatedText}
"""

Create structured notes with:
1. A brief overview/summary (2-3 sentences)
2. Key topics as main headings (##)
3. Important points as bullet points under each heading
4. Key terms/definitions if any
5. Important takeaways at the end

Format the notes in clean Markdown. Make them concise yet comprehensive, perfect for studying.`;

  return generateText(prompt, { temperature: 0.5, maxOutputTokens: 2000 });
};

/**
 * Generate MCQ quiz from topic or text
 */
const generateQuiz = async (input, questionCount = 7, inputType = 'topic') => {
  const truncatedInput = input.length > 8000 ? input.substring(0, 8000) + '...[truncated]' : input;

  const contextDescription = inputType === 'pdf'
    ? `the following document content:\n"""\n${truncatedInput}\n"""`
    : `the topic: "${truncatedInput}"`;

  const prompt = `You are an expert quiz creator. Generate exactly ${questionCount} multiple choice questions based on ${contextDescription}.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation, just the JSON object.

Required JSON format:
{
  "title": "Quiz title here",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- Generate exactly ${questionCount} questions
- Each question must have exactly 4 options (A, B, C, D)
- correctAnswer must be exactly one of: "A", "B", "C", "D"
- Questions should test understanding, not just memorization
- Vary difficulty: mix easy, medium, and hard questions
- Make wrong options plausible but clearly incorrect`;

  const content = await generateText(prompt, { temperature: 0.6, maxOutputTokens: 2500 });

  // Parse JSON response
  try {
    // Remove potential markdown code blocks
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (parseError) {
    throw new Error('Failed to parse quiz response. Please try again.');
  }
};

module.exports = { answerQuestion, generateNotes, generateQuiz };

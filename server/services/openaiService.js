const OpenAI = require('openai');

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL })
    });
  }
  return openaiClient;
};

const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

/**
 * Answer a user question with conversation history context
 */
const answerQuestion = async (question, history = []) => {
  const client = getOpenAIClient();

  const systemPrompt = `You are an expert AI tutor and doubt solver. You help students understand complex topics clearly and concisely.
Guidelines:
- Give clear, structured answers
- Use examples when helpful
- Break down complex concepts step by step
- If a question is ambiguous, address the most likely interpretation
- Format mathematical expressions clearly
- Be encouraging and educational in tone`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => [
      { role: 'user', content: h.question },
      { role: 'assistant', content: h.answer }
    ]).flat(),
    { role: 'user', content: question }
  ];

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1500
  });

  return response.choices[0].message.content;
};

/**
 * Generate structured notes from extracted PDF text
 */
const generateNotes = async (text, title = 'Document') => {
  const client = getOpenAIClient();

  // Truncate text if too long (keep within token limits)
  const truncatedText = text.length > 12000 ? text.substring(0, 12000) + '...[truncated]' : text;

  const prompt = `You are an expert note-taker and educator. Analyze the following text and create comprehensive, well-structured study notes.

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

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 2000
  });

  return response.choices[0].message.content;
};

/**
 * Generate MCQ quiz from topic or text
 */
const generateQuiz = async (input, questionCount = 7, inputType = 'topic') => {
  const client = getOpenAIClient();

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

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 2500
  });

  const content = response.choices[0].message.content.trim();

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

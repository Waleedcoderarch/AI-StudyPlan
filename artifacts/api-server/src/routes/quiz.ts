import { Router } from "express";
import { db } from "@workspace/db";
import { quizzesTable, quizAttemptsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq, desc, avg, count } from "drizzle-orm";

const router = Router();

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

router.post("/quiz/generate", async (req, res) => {
  try {
    const { topic, content, questionCount } = req.body as {
      topic: string;
      content?: string;
      questionCount: number;
    };

    if (!topic || !questionCount) {
      res.status(400).json({ error: "topic and questionCount are required" });
      return;
    }

    const count = Math.min(Math.max(questionCount, 5), 10);

    const systemPrompt = `You are an expert quiz generator. Generate exactly ${count} multiple-choice questions (MCQs). 
Return ONLY a valid JSON array with no markdown or extra text. Each question must follow this exact format:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]
correctAnswer is the 0-based index of the correct option in the options array.
Make questions varied in difficulty and test real understanding.`;

    const userContent = content
      ? `Generate ${count} MCQs for the topic "${topic}" based on this content:\n\n${content}`
      : `Generate ${count} MCQs for the topic "${topic}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content ?? "[]";
    
    let questions: QuizQuestion[];
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      res.status(500).json({ error: "Failed to parse quiz questions from AI response" });
      return;
    }

    const [saved] = await db.insert(quizzesTable).values({
      topic,
      questions,
    }).returning();

    res.json({
      id: saved.id,
      topic: saved.topic,
      questions: saved.questions as QuizQuestion[],
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

router.get("/quiz/history", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable).orderBy(desc(quizzesTable.createdAt));

    const result = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await db
          .select()
          .from(quizAttemptsTable)
          .where(eq(quizAttemptsTable.quizId, quiz.id));

        const bestScore = attempts.length > 0
          ? Math.max(...attempts.map((a) => a.score))
          : null;

        const qs = quiz.questions as QuizQuestion[];
        return {
          id: quiz.id,
          topic: quiz.topic,
          questionCount: qs.length,
          bestScore,
          attempts: attempts.length,
          createdAt: quiz.createdAt.toISOString(),
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
});

router.get("/quiz/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json({
      id: quiz.id,
      topic: quiz.topic,
      questions: quiz.questions as QuizQuestion[],
      createdAt: quiz.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

router.post("/quiz/:id/submit", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { answers, timeTaken } = req.body as { answers: number[]; timeTaken?: number };

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: "answers array is required" });
      return;
    }

    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const questions = quiz.questions as QuizQuestion[];
    const correctAnswers = questions.map((q) => q.correctAnswer);
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === correctAnswers[index] ? 1 : 0);
    }, 0);

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    await db.insert(quizAttemptsTable).values({
      quizId: id,
      score,
      totalQuestions,
      percentage,
      timeTaken: timeTaken ?? null,
      answers,
    });

    res.json({
      quizId: id,
      score,
      totalQuestions,
      percentage,
      timeTaken: timeTaken ?? null,
      answers,
      correctAnswers,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

export default router;

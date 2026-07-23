import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, notesTable, quizzesTable, quizAttemptsTable } from "@workspace/db";
import { count, avg } from "drizzle-orm";

const router = Router();

router.get("/stats/overview", async (req, res) => {
  try {
    const [[convResult], [msgResult], [notesResult], [quizResult], [avgResult]] = await Promise.all([
      db.select({ count: count() }).from(conversations),
      db.select({ count: count() }).from(messages),
      db.select({ count: count() }).from(notesTable),
      db.select({ count: count() }).from(quizzesTable),
      db.select({ avg: avg(quizAttemptsTable.percentage) }).from(quizAttemptsTable),
    ]);

    res.json({
      totalConversations: Number(convResult.count),
      totalMessages: Number(msgResult.count),
      totalNotes: Number(notesResult.count),
      totalQuizzes: Number(quizResult.count),
      averageQuizScore: avgResult.avg ? parseFloat(avgResult.avg) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;

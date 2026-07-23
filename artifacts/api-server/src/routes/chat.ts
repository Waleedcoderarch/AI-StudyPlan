import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq, desc, count, inArray } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router();

router.get("/chat/conversations", async (req, res) => {
  try {
    const convRows = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));

    if (convRows.length === 0) {
      res.json([]);
      return;
    }

    const ids = convRows.map((c) => c.id);
    const msgCounts = await db
      .select({ conversationId: messages.conversationId, cnt: count(messages.id) })
      .from(messages)
      .where(inArray(messages.conversationId, ids))
      .groupBy(messages.conversationId);

    const countMap = new Map(msgCounts.map((m) => [m.conversationId, Number(m.cnt)]));

    res.json(
      convRows.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        messageCount: countMap.get(c.id) ?? 0,
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/chat/conversations", async (req, res) => {
  try {
    const { title } = req.body as { title?: string };
    if (!title || !title.trim()) {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    const [conv] = await db
      .insert(conversations)
      .values({ title: title.trim() })
      .returning();
    res.status(201).json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messageCount: 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/chat/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    res.json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: msgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

router.delete("/chat/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.post("/chat/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = SendMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const { content } = parsed.data;

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content,
    });

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    const chatMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable AI tutor. Answer academic and technical questions clearly, thoroughly, and accurately. Use markdown formatting — headings, bullet points, code blocks, bold — to structure your responses for easy reading. Be precise, educational, and thorough.",
        },
        ...chatMessages,
      ],
    });

    const aiContent =
      completion.choices[0]?.message?.content ?? "I could not generate a response.";

    const [aiMsg] = await db
      .insert(messages)
      .values({ conversationId: id, role: "assistant", content: aiContent })
      .returning();

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));

    res.json({
      id: aiMsg.id,
      conversationId: aiMsg.conversationId,
      role: aiMsg.role,
      content: aiMsg.content,
      createdAt: aiMsg.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;

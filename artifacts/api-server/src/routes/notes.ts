import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq, desc } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/notes/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    if (req.file.mimetype !== "application/pdf") {
      res.status(400).json({ error: "Only PDF files are supported" });
      return;
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    res.json({
      text,
      filename: req.file.originalname,
      pageCount: data.numpages,
      wordCount,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

router.post("/notes/generate", async (req, res) => {
  try {
    const { content, title, source } = req.body as { content: string; title: string; source?: string };

    if (!content || !title) {
      res.status(400).json({ error: "content and title are required" });
      return;
    }

    const truncatedContent = content.length > 60000 ? content.slice(0, 60000) + "\n\n[Content truncated for processing...]" : content;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are an expert academic note-taker and educator. Your job is to transform raw text (often extracted from PDFs) into clear, comprehensive, exam-ready study notes.

CRITICAL RULES:
1. Preserve ALL factual information — never omit or simplify key facts, dates, names, formulas, or definitions
2. Fix any OCR/extraction artifacts (weird spacing, line breaks mid-word, garbled text) intelligently
3. Organize content into a logical hierarchy even if the source text is poorly structured
4. Include EVERY important concept, not just highlights
5. Do NOT add information that isn't in the source — only reorganize and clarify what exists

FORMAT:
# [Topic Title]

## Overview
[2-3 sentence summary of what this document covers]

## [Main Section 1]
### [Subsection if needed]
- **Key term**: Definition or explanation
- Important point with full detail
- Formulas, dates, names preserved exactly as in source

## [Main Section 2]
...continue for ALL sections...

## Key Definitions
- **Term**: Precise definition

## Important Formulas / Facts
[If applicable — list all formulas, statistics, key data]

## Summary & Key Takeaways
- Most important points to remember
- Critical relationships between concepts

Use **bold** for all technical terms, key names, and important facts.
Use \`code blocks\` for formulas, code, or technical syntax.
Be comprehensive — a student should be able to study for an exam using only these notes.`,
        },
        {
          role: "user",
          content: `Create comprehensive study notes for the document titled "${title}". Preserve all factual accuracy and include all important information.\n\nSOURCE CONTENT:\n${truncatedContent}`,
        },
      ],
    });

    const notes = completion.choices[0]?.message?.content ?? "Could not generate notes.";

    const [saved] = await db.insert(notesTable).values({
      title,
      notes,
      source: source ?? null,
    }).returning();

    res.json({
      id: saved.id,
      title: saved.title,
      notes: saved.notes,
      source: saved.source ?? null,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate notes" });
  }
});

router.get("/notes/history", async (req, res) => {
  try {
    const rows = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt));
    res.json(rows.map((r) => ({
      id: r.id,
      title: r.title,
      notes: r.notes,
      source: r.source ?? null,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch notes history" });
  }
});

router.get("/notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [note] = await db.select().from(notesTable).where(eq(notesTable.id, id));
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json({
      id: note.id,
      title: note.title,
      notes: note.notes,
      source: note.source ?? null,
      createdAt: note.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

router.delete("/notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(notesTable).where(eq(notesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;

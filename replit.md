# AI Doubt Solver & Notes Generator

## Overview

A full-stack learning companion application with AI-powered features:
- **AI Doubt Solver**: Chat-based Q&A with conversation history
- **PDF Notes Generator**: Upload PDFs, extract text, generate structured notes
- **Quiz Generator**: Generate and take interactive MCQ quizzes with timer
- **History**: Browse saved notes and quiz history
- **Dashboard**: Usage statistics overview

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **PDF Parsing**: pdf-parse
- **File Upload**: multer

## Architecture

- `artifacts/ai-doubt-solver/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express API server (served at `/api`)
- `lib/db/` — Drizzle ORM database schemas
- `lib/api-spec/` — OpenAPI spec and codegen config
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas
- `lib/integrations-openai-ai-server/` — OpenAI server-side integration

## Database Tables

- `conversations` — Chat conversations
- `messages` — Chat messages (user/assistant)
- `notes` — Generated study notes from PDFs
- `quizzes` — Generated MCQ quizzes (questions stored as JSONB)
- `quiz_attempts` — Quiz attempt scores and answers

## API Routes

- `GET/POST /api/chat/conversations` — List/create conversations
- `GET/DELETE /api/chat/conversations/:id` — Get/delete conversation
- `POST /api/chat/conversations/:id/messages` — Send message, get AI response
- `POST /api/notes/upload` — Upload PDF and extract text
- `POST /api/notes/generate` — Generate structured notes from text
- `GET /api/notes/history` — List saved notes
- `GET/DELETE /api/notes/:id` — Get/delete saved note
- `POST /api/quiz/generate` — Generate quiz from topic
- `GET /api/quiz/history` — List quizzes with attempt stats
- `GET /api/quiz/:id` — Get quiz
- `POST /api/quiz/:id/submit` — Submit quiz answers, get score
- `GET /api/stats/overview` — Usage statistics

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/ai-doubt-solver run dev` — run frontend locally

## Environment Variables

- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-set by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-set by Replit AI Integrations
- `DATABASE_URL` — Auto-set by Replit PostgreSQL database

# 🤖 AI Study Hub — Doubt Solver & Notes Generator

A full-stack AI-powered study tool with three core features:
- **💬 AI Doubt Solver** — Conversational Q&A with GPT, full history
- **📄 Notes Generator** — Upload PDF → extract text → AI structured notes → download
- **🎯 Quiz Generator** — Generate interactive MCQs from any topic or PDF, with timer & scoring

---

## 🏗 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router |
| Backend    | Node.js, Express, REST API             |
| AI         | OpenAI GPT-3.5-Turbo                   |
| Database   | MongoDB (Mongoose)                     |
| File Parse | pdf-parse, multer                      |

---

## 📁 Project Structure

```
ai-doubt-solver/
├── package.json             ← root (concurrently runner)
│
├── server/
│   ├── index.js             ← Express entry point
│   ├── .env.example         ← Copy to .env and fill values
│   ├── routes/
│   │   ├── ask.js           ← POST /api/ask
│   │   ├── upload.js        ← POST /api/upload
│   │   ├── notes.js         ← POST /api/notes
│   │   ├── quiz.js          ← POST /api/quiz
│   │   └── history.js       ← GET  /api/history/:sessionId
│   ├── controllers/
│   │   ├── askController.js
│   │   ├── uploadController.js
│   │   ├── notesController.js
│   │   └── quizController.js
│   ├── services/
│   │   ├── openaiService.js ← All GPT prompt engineering
│   │   └── pdfService.js    ← PDF text extraction
│   └── models/
│       ├── Conversation.js
│       ├── Note.js
│       └── Quiz.js
│
└── client/
    ├── index.html
    ├── vite.config.js       ← Proxy /api → localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           ← Router + ThemeContext + SessionContext
        ├── index.css         ← Global styles + CSS variables
        ├── main.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ChatUI.jsx
        │   ├── FileUpload.jsx
        │   ├── QuizUI.jsx
        │   └── LoadingSpinner.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── DoubtSolver.jsx
        │   ├── NotesGenerator.jsx
        │   └── QuizPage.jsx
        └── services/
            └── api.js        ← All axios API calls
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher
- **OpenAI API Key** — [platform.openai.com](https://platform.openai.com/api-keys)
- **MongoDB** — [MongoDB Atlas (free)](https://www.mongodb.com/atlas) or local install

---

## 🚀 Setup Instructions

### 1. Clone / Download the project

```bash
cd ai-doubt-solver
```

### 2. Create the `.env` file for the backend

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-doubt-solver
PORT=5000
```

> **MongoDB Atlas (free tier):**
> 1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
> 2. Create a free cluster
> 3. Click Connect → Drivers → copy the connection string
> 4. Replace `<password>` with your DB user password
>
> **Local MongoDB:**
> ```env
> MONGO_URI=mongodb://localhost:27017/ai-doubt-solver
> ```
> MongoDB is **optional** — the app works without it, just without history.

### 3. Install all dependencies

```bash
# From the root folder:
npm run install:all

# Or manually:
npm install
cd server && npm install
cd ../client && npm install
```

---

## ▶️ Running Locally

### Option A — Run both together (recommended)

```bash
# From root:
npm run dev
```

This starts:
- Backend at `http://localhost:5000`
- Frontend at `http://localhost:5173`

### Option B — Run separately

**Terminal 1 (backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (frontend):**
```bash
cd client
npm run dev
```

Then open: **[http://localhost:5173](http://localhost:5173)**

---

## 🔌 API Endpoints

| Method | Route                         | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/api/health`                 | Server health check      |
| POST   | `/api/ask`                    | Ask AI a question        |
| GET    | `/api/ask/history/:sessionId` | Load conversation history|
| POST   | `/api/upload`                 | Upload & extract PDF text|
| POST   | `/api/notes`                  | Generate notes from text |
| GET    | `/api/notes/history/:session` | Load notes history       |
| POST   | `/api/quiz`                   | Generate MCQ quiz        |
| POST   | `/api/quiz/result`            | Save quiz score          |
| GET    | `/api/quiz/history/:session`  | Load quiz history        |
| GET    | `/api/history/:sessionId`     | All history aggregated   |

---

## 🌟 Features

- ✅ AI-powered chat with GPT-3.5 (full conversation context)
- ✅ PDF upload with text extraction (up to 10MB)
- ✅ AI-structured notes in markdown (headings + bullets)
- ✅ Download notes as `.txt` file
- ✅ Interactive MCQ quiz with 4 options per question
- ✅ Live countdown timer per quiz
- ✅ Score breakdown with explanations
- ✅ Dark/light mode toggle
- ✅ Per-device session ID (localStorage)
- ✅ MongoDB history (gracefully optional)
- ✅ Responsive design (mobile-friendly)

---

## 🐞 Troubleshooting

| Problem | Fix |
|---------|-----|
| `OPENAI_API_KEY not set` | Add key to `server/.env` |
| `Cannot connect to server` | Start backend with `cd server && npm run dev` |
| `Invalid PDF` | Ensure file is not password-protected or image-only |
| MongoDB errors | Check `MONGO_URI` or leave blank to run without DB |
| Port 5000 in use | Change `PORT=5001` in `.env` and update `vite.config.js` proxy |

---

## 📜 License

MIT — free to use and modify.

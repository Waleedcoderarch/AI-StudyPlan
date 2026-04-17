# AI Study Hub

AI Study Hub is a full-stack study assistant with three main features:

- AI Doubt Solver for question-answering
- Notes Generator for turning PDF content into study notes
- Quiz Generator for creating MCQs from a topic or extracted text

The frontend is built with React and Vite, and the backend is built with Node.js and Express. AI responses are powered by Groq.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- AI Provider: Groq
- Database: SQLite with Sequelize
- File Processing: `multer`, `pdf-parse`

## Project Structure

```text
claude-project/
|-- package.json
|-- client/
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
`-- server/
    |-- package.json
    |-- index.js
    |-- db.js
    |-- .env.example
    |-- controllers/
    |-- models/
    |-- routes/
    `-- services/
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm
- A valid Groq API key

## How To Run This Project

If someone clones this project fresh, this is the easiest way to run it.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd claude-project
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Create the backend environment file

Inside the `server` folder, create a `.env` file.

You can copy the values from `.env.example`.

Example:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
MONGO_URI=mongodb://localhost:27017/ai-doubt-solver
PORT=5000
```

Notes:

- `GROQ_API_KEY` is required for AI features.
- `GROQ_MODEL` can stay as `llama-3.1-8b-instant`.
- `MONGO_URI` is currently not important for the main app flow because the project is using SQLite through Sequelize.
- `PORT=5000` is the backend port.

### 6. Start the backend

Open a terminal and run:

```bash
cd server
npm run dev
```

### 7. Start the frontend

Open a second terminal and run:

```bash
cd client
npm run dev
```

### 8. Open the app in the browser

```text
http://localhost:5173
```

The frontend talks to the backend at:

```text
http://localhost:5000
```

## Quick Checks

### Backend health check

Open:

```text
http://localhost:5000/api/health
```

You should see:

```json
{"status":"OK","message":"AI Doubt Solver API is running"}
```

### Test the app

- Open the AI Doubt Solver page
- Ask a question
- Upload a PDF to test notes generation
- Generate a quiz from a topic or extracted text

## Available Scripts

From the project root:

- `npm run dev` starts frontend and backend together
- `npm run build` builds the frontend

From the `server` folder:

- `npm run dev` starts the backend with nodemon
- `npm start` starts the backend normally

From the `client` folder:

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build

## API Endpoints

- `GET /api/health` - health check
- `POST /api/ask` - ask the AI a question
- `GET /api/ask/history/:sessionId` - fetch conversation history
- `POST /api/upload` - upload and extract text from a PDF
- `POST /api/notes` - generate study notes
- `GET /api/notes/history/:sessionId` - fetch notes history
- `POST /api/quiz` - generate a quiz
- `POST /api/quiz/result` - save quiz results
- `GET /api/quiz/history/:sessionId` - fetch quiz history
- `GET /api/history/:sessionId` - fetch combined history

## Common Problems

### Groq API quota exceeded

Use a valid Groq key with available quota or billing.

### Invalid Groq API key

Check `GROQ_API_KEY` in `server/.env`.

### Port already in use

If you see `EADDRINUSE`, port `5000` or `5173` is already being used by another process. Stop that process or change the port.

### Frontend loads but API fails

Make sure the backend is running on port `5000`.

### PDF does not work

Make sure the uploaded file is a valid PDF and not password-protected.

## Important Note

Do not commit your real API key to GitHub. Keep it only in `server/.env`.

If a key is ever shared accidentally, rotate it immediately in your Groq dashboard.

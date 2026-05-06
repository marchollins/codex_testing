# CDMP Prep Hub

A lightweight static web app to practice key data management and governance concepts relevant to the DAMA CDMP exam.

## Features

- Domain and difficulty filters for targeted practice
- Randomized multiple-choice questions with immediate explanation support
- Adaptive **Practice Weak Area** action to focus your lowest-performing domain
- Session streak and best-streak tracking
- Domain-level performance table (answered, correct, accuracy)
- Browser-only persistence with `localStorage`
- Node.js server foundation for future API and database-backed progress

## Run locally

Install dependencies and start the Node.js server:

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

For development with automatic restarts:

```bash
npm run dev
```

You can override the bind address and port with environment variables:

```bash
PORT=4000 HOST=127.0.0.1 npm start
```

Progress is still stored only in the browser with `localStorage`. No database or database driver has been added yet.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Open your repository and go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or default branch) and folder `/ (root)`
4. Save and wait for the Pages URL.

The app can still be served statically, but the primary local runtime is now Node.js.

## Recommended next steps for CDMP prep

- Expand the question bank by CDMP domain and DAMA DMBOK chapter.
- Add timed mock exam mode (e.g., 30-50 questions).
- Add tags for glossary, policy, quality dimensions, and architecture patterns.
- Add API routes and a database adapter when you are ready to persist questions and user progression server-side.

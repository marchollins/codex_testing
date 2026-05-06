# CDMP Prep Hub

A lightweight static web app to practice key data management and governance concepts relevant to the DAMA CDMP exam.

## Features

- Domain and difficulty filters for targeted practice
- Randomized multiple-choice questions with immediate explanation support
- Adaptive **Practice Weak Area** action to focus your lowest-performing domain
- Session streak and best-streak tracking
- Domain-level performance table (answered, correct, accuracy)
- Browser-only persistence with `localStorage`
- Next.js App Router foundation for future API and database-backed progress

## Run locally

Install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Build the production app:

```bash
npm run build
```

Run the production build:

```bash
npm start
```

Progress is still stored only in the browser with `localStorage`. No database or database driver has been added yet.

## Deploy

This app now runs as a Next.js application. Deploy it to a platform that supports Next.js, or add an export configuration later if you decide you need fully static hosting.

## Recommended next steps for CDMP prep

- Expand the question bank by CDMP domain and DAMA DMBOK chapter.
- Add timed mock exam mode (e.g., 30-50 questions).
- Add tags for glossary, policy, quality dimensions, and architecture patterns.
- Add API routes and a database adapter when you are ready to persist questions and user progression server-side.

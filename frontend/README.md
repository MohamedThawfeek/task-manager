# TaskFlow frontend

A responsive task and project management frontend built with Vite, React, Tailwind CSS, Redux Toolkit, React Router, React Hook Form, Zod, Axios, Day.js, Lucide, Recharts, and React Hot Toast.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The demo login is prefilled (`sarah@company.com` / `password`), though any valid email and password of at least six characters works in local mode.

## Data mode

The app intentionally defaults to browser `localStorage` because the included backend requires an active MongoDB configuration and does not currently expose all reads/features required by this UI. Local mode supports working task, project, team, checklist, comment, settings, attachment-preview, Kanban, search, filter, and theme interactions.

Copy `.env.example` to `.env` when preparing a backend integration. `src/services/storage.js` contains the Axios client and storage adapter boundary. Do not set `VITE_USE_BACKEND=true` until the backend response contracts and authentication middleware are completed.

## Commands

```bash
npm run dev      # development server
npm run build    # production bundle
npm run preview  # preview the production bundle
npm run lint     # static checks
```

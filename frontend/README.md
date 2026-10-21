# TaskFlow frontend

A responsive task and project management frontend built with Vite, React, Tailwind CSS, Redux Toolkit, React Router, React Hook Form, Zod, Axios, Day.js, Lucide, Recharts, and React Hot Toast.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Authentication expects the backend to be running at `http://localhost:5001/v1` by default.

## Data mode

Login, registration, forgot-password, reset-password, and team-member management use the backend API. Authentication is stored in `localStorage` when “Remember me” is enabled and in `sessionStorage` otherwise. Reset links open `/reset-password?token=...`.

Task, project, checklist, comment, settings, attachment-preview, Kanban, search, filter, and theme data continue to use browser storage. Copy `.env.example` to `.env` to override the API URL for another environment.

## Source structure

```text
src/
├── components/          # Reusable visual components and forms
├── data/                # Local seed data
├── hooks/               # Page behavior, API orchestration, and UI state
│   ├── auth/
│   ├── calendar/
│   ├── dashboard/
│   ├── layout/
│   ├── profile/
│   ├── project/
│   ├── report/
│   ├── settings/
│   ├── task/
│   └── team/
├── layouts/             # Authenticated application shell
├── pages/               # UI markup only
├── redux/               # Provider, store, and synchronous shared-state slices
├── routes/              # Public and protected route definitions
├── service/             # Axios client, API paths, and domain services
├── utils/               # Shared data helpers
└── validations/         # Reusable form schemas
```

The application follows a page-and-hook split: pages render the interface, feature hooks manage page state and actions, services perform HTTP requests, and Redux slices store shared state.

## Commands

```bash
npm run dev      # development server
npm run build    # production bundle
npm run preview  # preview the production bundle
npm run lint     # static checks
```

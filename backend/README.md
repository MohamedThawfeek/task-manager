# AI Task Manager — Node.js + Express + MongoDB + Ollama

Complete demo backend with Admin/User authentication, team members, tasks, TODO checklists, AI task generation, and a task-question chatbot. **No frontend included.**

## Requirements
- Node.js 20+
- MongoDB running locally (or replace `MONGO_URI`)
- Ollama installed and running

## Setup
```bash
npm install
cp .env.example .env
# edit .env: set JWT_SECRET to a long random secret
ollama pull qwen2.5:3b
# Ollama must be running: ollama serve (if not already running)
npm run seed
npm run dev
```

Demo users created by `npm run seed`:
- Admin: `admin@example.com` / `Admin@123456`
- Member: `member@example.com` / `Member@123456`

**For local learning only:** change demo passwords, configure a restricted CORS origin, use HTTPS, and disable demo accounts before deploying.

## Step-by-step test with curl

1. Login:
```bash
curl -X POST http://localhost:5001/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"Admin@123456"}'
```
Copy the `token` from response, then run `export TOKEN='PASTE_TOKEN'`.

2. AI generates task form data (not saved):
```bash
curl -X POST http://localhost:5001/api/ai/generate-task -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"Build a React login page"}'
```

3. Save task (replace `assigned_to` with team member IDs from GET `/api/team-members` if desired):
```bash
curl -X POST http://localhost:5001/api/tasks -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"Build login page","description":"React login form","priority":"High","status":"Pending","due_date":"2026-11-05","assigned_to":[],"todos":[{"title":"Create form"},{"title":"Connect API"}]}'
```

4. Ask chatbot:
```bash
curl -X POST http://localhost:5001/api/ai/chat -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"question":"How many high priority pending tasks do I have?"}'
```

5. Try questions: "How many tasks are overdue?", "Show pending tasks", "What percentage of my tasks are completed?", "Give me priority breakdown", "How many tasks are due this month?".

6. List tasks:
```bash
curl http://localhost:5001/api/tasks -H "Authorization: Bearer $TOKEN"
```

## API summary
| Method | Path | Permission |
|---|---|---|
| POST | /api/auth/login | Public |
| POST | /api/team-members | Admin |
| GET | /api/team-members | Admin |
| POST | /api/tasks | Admin |
| GET | /api/tasks | Authenticated |
| PATCH | /api/tasks/:id | Admin creator |
| DELETE | /api/tasks/:id | Admin creator |
| PATCH | /api/tasks/:id/todos/:todoId | Assigned user / creator |
| POST | /api/ai/generate-task | Admin |
| POST | /api/ai/chat | Authenticated |

## Request execution order
- `src/server.js` loads environment variables, connects MongoDB, and starts the HTTP server.
- `src/app.js` configures Express, rate limits, routes, and error handling.
- `src/routes/index.js` routes requests and checks tokens through `src/middleware/auth.js`.
- AI generation: `src/controllers/ai.js:generate` -> `src/services/ollama.js` -> Zod validation -> JSON response -> user reviews -> POST `/api/tasks` -> MongoDB.
- Chat: `src/controllers/ai.js:chat` -> `src/services/ollama.js` (question to JSON intent) -> `src/services/query.js` (authorization filter + MongoDB query) -> deterministic answer + data.

## Folder structure

```text
src/
├── app.js                 # Express configuration
├── server.js              # Database connection and HTTP startup
├── seed.js                # Development seed command
├── config/                # Database and application configuration
├── controllers/           # HTTP request handlers
├── middleware/            # Authentication, authorization, and errors
├── models/                # Mongoose schemas
├── routes/                # API route registration
├── services/              # Ollama and database-query business logic
└── utils/                 # Shared validation helpers
```

## Safety and design notes
- Ollama does **not** execute arbitrary database queries; it returns only an allowlisted intent.
- User scope is calculated from verified JWT identity. Admin scope includes only tasks they created; user scope includes tasks assigned to their team-member record.
- `task_percentage` divides matching tasks by all visible tasks in the requested date period.
- Overdue means due before today and not completed. `today`, `this_week`, and `this_month` use the Node.js process timezone (`TZ=Asia/Kolkata`).
- Priority and status breakdowns honor the requested date and opposite-dimension filters.
- The AI can misclassify ambiguous questions. Inspect the returned `intent`, and add an explicit confirmation flow for ambiguous or unsupported questions.
- There is no free-form MongoDB query generation, arbitrary tool execution, or direct Ollama DB connection.
- To keep answers fast and factual, the second Ollama call is omitted: Node.js formats answers from MongoDB results.
- Demo is single-organization; add `company_id` on every collection and authorization filter for multi-tenant SaaS.
- Seed data and demo login credentials are for development only.


## First administrator registration

When no admin exists, open the React app and select **Register admin**. The endpoint is `POST /api/auth/register-admin` with `{ "name": "Your Name", "email": "you@example.com", "password": "a-long-unique-password" }`. Password must contain at least 12 characters. After first registration, public admin registration closes. `GET /api/auth/registration-status` returns `{ "registrationOpen": false }` once set up. Team member accounts are created by the admin in Team Members.

If you already ran `npm run seed`, the demo admin exists and registration will be closed. Use the seeded account to log in, or use a **new empty database** for first-time registration. Never delete production user data to reopen registration.

For production, run first-admin setup through a private deployment process; do not expose bootstrap registration publicly.

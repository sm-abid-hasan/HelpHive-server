# HelpHive Server

Express + MongoDB API for HelpHive. Protected routes are checked with a JWT issued by Better Auth (the Next.js client).

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values.
3. (Optional) `npm run seed` adds sample events.
4. `npm run dev`  -> http://localhost:5000

## API

| Method | Route | Access | What it does |
|---|---|---|---|
| GET | `/api/events?limit=6&search=&type=` | Public | Upcoming events only, soonest first |
| GET | `/api/events/:id` | Public | One event |
| POST | `/api/events` | JWT | Create an event |
| GET | `/api/events/my` | JWT | Events created by me |
| PUT | `/api/events/:id` | JWT, owner | Update my event |
| DELETE | `/api/events/:id` | JWT, owner | Delete my event |
| POST | `/api/events/:id/join` | JWT | Join an event |
| DELETE | `/api/events/:id/join` | JWT | Leave an event |
| GET | `/api/events/:id/joined` | JWT | Have I joined this event? |
| GET | `/api/joins/my` | JWT | My joined events, sorted by event date |

## Deploy

Render: Web Service, root directory `server`, build `npm install`, start `npm start`, add the env variables.
Vercel also works (a `vercel.json` is included).

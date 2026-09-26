# Node.js homework - Express

A minimal Express API for working with notes.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if `.env` is missing.
3. Start the development server with `npm run dev`, or the production server with `npm start`.

The server uses `PORT` from the environment and falls back to port `3000`.

## Routes

- `GET /notes` - returns a message for all notes.
- `GET /notes/:noteId` - returns a message containing the requested note ID.
- `GET /test-error` - throws a simulated error to test the 500 handler.
- Any unknown route returns a 404 response.

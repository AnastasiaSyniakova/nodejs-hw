# Node.js homework - Authentication

An Express API for authenticated users to store and manage private notes in
MongoDB.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if `.env` is missing.
3. Replace the placeholders in `MONGO_URL` with your MongoDB Atlas database
   username and password.
4. Start the development server with `npm run dev`, or the production server
   with `npm start`.

The server connects to MongoDB before it starts listening. It uses `PORT` from
the environment and falls back to port `3000`.

## Routes

- `POST /auth/register` - creates a user and session.
- `POST /auth/login` - authenticates a user and replaces their session.
- `POST /auth/refresh` - replaces a valid refresh session.
- `POST /auth/logout` - deletes the current session and clears its cookies.
- `GET /notes` - returns paginated notes and supports `tag` and `search`
  filters. The `page` and `perPage` query parameters default to `1` and `10`.
- `GET /notes/:noteId` - returns one note by ID.
- `POST /notes` - creates a note.
- `PATCH /notes/:noteId` - updates a note by ID.
- `DELETE /notes/:noteId` - deletes a note by ID.
- Any unknown route returns a 404 response.

All `/notes` routes require a valid `accessToken` cookie and only access the
authenticated user's notes.

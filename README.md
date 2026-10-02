# Node.js homework - MongoDB

An Express API for storing and managing notes in MongoDB.

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

- `GET /notes` - returns all notes.
- `GET /notes/:noteId` - returns one note by ID.
- `POST /notes` - creates a note.
- `PATCH /notes/:noteId` - updates a note by ID.
- `DELETE /notes/:noteId` - deletes a note by ID.
- Any unknown route returns a 404 response.

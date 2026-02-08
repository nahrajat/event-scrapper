# Sydney Events Scraper

Full-stack assignment that scrapes event listings for Sydney, stores them in MongoDB, and serves them through a React dashboard and public events page.

## Features

- Automated scraping from multiple sources with scheduled refresh.
- Public events listing page with ticket lead capture.
- Admin dashboard with Google Sign-In to review and import events.
- REST API for events, leads, and admin actions.

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Mongoose
- Database: MongoDB (local or Atlas)
- Auth: Google Identity Services (ID token verification)

## Project Structure

```
backend/   # Express API, scrapers, Mongo models
frontend/  # React app (Vite)
```

## Setup

### 1) Install dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 2) Configure environment variables

Create [backend/.env](backend/.env):

```dotenv
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=change-me
GOOGLE_CLIENT_ID=<google-oauth-client-id>
CORS_ORIGIN=http://localhost:5173
```

Create [frontend/.env](frontend/.env):

```dotenv
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

### 3) Run the backend

```bash
npm --prefix backend run dev
```

### 4) Run the scraper (initial data)

```bash
npm --prefix backend run scrape
```

### 5) Run the frontend

```bash
npm --prefix frontend run dev
```

The app runs at http://localhost:5173 by default. If Vite chooses a different port, update `CORS_ORIGIN` in [backend/.env](backend/.env).

## Scripts

Backend:

- `npm --prefix backend run dev` - start API server
- `npm --prefix backend run scrape` - one-off scrape

Frontend:

- `npm --prefix frontend run dev` - start Vite dev server
- `npm --prefix frontend run build` - production build

## API Overview

- `GET /api/health` - health check
- `GET /api/events` - list events (filters: `city`, `q`, `start`, `end`, `status`)
- `POST /api/leads` - create a ticket lead
- `POST /api/auth/google` - Google Sign-In (ID token)
- `GET /api/admin/events` - admin list
- `PATCH /api/admin/events/:id/import` - mark imported

## Troubleshooting

- No events on homepage: run the scraper, then refresh the frontend.
- CORS error: ensure `CORS_ORIGIN` matches your Vite URL (e.g., `http://localhost:5174`).
- MongoDB connection error: verify `MONGODB_URI` and Atlas Network Access.

## Notes

This project uses Google Identity Services on the frontend and verifies the ID token on the backend. Authorized JavaScript origins are required in the Google Cloud Console; redirect URIs are not needed for this flow.

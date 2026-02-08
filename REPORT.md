# Sydney Events Scraper - Project Report

## 1. Overview

This project is a full-stack event aggregation app built as an internship assignment. It scrapes public event listings for Sydney, stores them in MongoDB, and exposes them through a public events page and an admin dashboard. The goal is to demonstrate end-to-end skills across data collection, backend APIs, frontend UI, and deployment-ready configuration.

## 2. Objectives

- Build an automated scraper that collects event data from multiple sources.
- Normalize and store events in MongoDB with change tracking.
- Provide a public-facing UI to browse events and capture ticket leads.
- Provide an admin UI to review and import events.
- Implement Google Sign-In for admin access.

## 3. Tools and Technologies

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose, Axios, Cheerio, Day.js
- Database: MongoDB (local or Atlas)
- Auth: Google Identity Services (ID token verification)
- Scheduler: node-cron for periodic scraping
- Dev tools: ESLint, dotenv

## 4. Architecture

The system uses a simple client-server architecture:

- Frontend (React) calls REST endpoints to fetch events and submit leads.
- Backend (Express) handles auth, events, leads, and admin routes.
- Scrapers collect data from event sources and sync into MongoDB.
- A scheduled job re-runs scrapers to keep listings fresh.

Data flow overview:

1) Scrapers fetch listing pages and event detail pages.
2) JSON-LD is extracted where available; otherwise page HTML is parsed.
3) Events are normalized, then upserted into MongoDB.
4) The frontend requests events from `/api/events` and renders cards.
5) Admins sign in with Google and use `/api/admin` routes to review.

## 5. Scraping and Data Normalization

Two sources are currently implemented:

- Sydney.com
- Eventfinda

The scraper first attempts to parse JSON-LD event data. When JSON-LD is missing, it falls back to DOM selectors for title, date, venue, and description. Event fields are normalized (trimmed strings, parsed dates) so downstream UI and filters are consistent.

To avoid data drift and duplication:

- Events are keyed by `sourceUrl`.
- New events are created with status `new`.
- Existing events are updated and marked as `updated` if any key fields changed.
- Events missing from the latest scrape are set to `inactive` unless already imported.

## 6. Backend API

Main routes:

- `GET /api/health` - health check
- `GET /api/events` - public events list with query filters
- `POST /api/leads` - stores a lead capture when users click tickets
- `POST /api/auth/google` - verifies ID token and issues JWT
- `GET /api/admin/events` - admin list with filters
- `PATCH /api/admin/events/:id/import` - mark an event as imported

Auth flow:

- The frontend uses Google Identity Services to get an ID token.
- The backend verifies the token with Google and issues a JWT.
- Protected endpoints require the JWT in the Authorization header.

## 7. Frontend UI

The app includes two pages:

- Home: public event listing for Sydney with ticket lead capture.
- Dashboard: admin review and import actions.

React state and hooks are used to manage loading, filters, and selection. API access is centralized in a single Axios client configured via `VITE_API_URL`.

## 8. Environment and Configuration

Key environment variables:

Backend:

- `MONGODB_URI` - MongoDB connection string (Atlas or local)
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - allowed frontend origin

Frontend:

- `VITE_API_URL` - backend API base URL
- `VITE_GOOGLE_CLIENT_ID` - OAuth client ID

For Google Identity Services, only Authorized JavaScript Origins are required in the Google Cloud Console. Redirect URIs are not needed in this ID token flow.

## 9. Testing and Validation

Testing was performed manually:

- API health check with `GET /api/health`.
- Scraper run with `npm run scrape` to confirm inserts.
- UI fetch validation on the Home page.
- Admin login and import actions on the Dashboard.

Future testing improvements:

- Unit tests for JSON-LD extraction and normalization.
- Integration tests for event sync logic.
- Mocked UI tests for list rendering and filtering.

## 10. Challenges and Fixes

- CORS issues when Vite chose a non-default port. Fixed by updating `CORS_ORIGIN` to match the dev server URL.
- Empty event list due to missing scrape data. Fixed by running the scraper and verifying API output.
- Atlas connection delays. Fixed by verifying Network Access rules and valid connection strings.

## 11. Future Enhancements

- Add more sources and pagination support.
- Improve search with full-text indexes.
- Add caching and rate limiting for scrapers.
- Add user-facing filters and saved events.
- Production deployment with CI/CD and monitoring.

## 12. Conclusion

This project demonstrates a complete pipeline from data acquisition to end-user presentation. It covers scraping, storage, API design, and UI development with a clear separation between frontend and backend. The codebase is modular, environment-driven, and ready for iterative improvements and production hardening.

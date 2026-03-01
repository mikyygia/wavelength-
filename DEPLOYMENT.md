# Deployment Guide

## Architecture
- Frontend: Vercel (React + Vite)
- Backend: Render/Railway/Fly (Express API)
- Database: persistent hosted DB (recommended: Postgres/Supabase).  
  SQLite file storage on serverless/ephemeral runtimes is not reliable for shared multi-user production usage.

## 1) Deploy Backend First
1. Push repo to GitHub.
2. Create backend service from `wavelength-backend`.
3. Build/start:
   - Build command: `npm install`
   - Start command: `npm start`
4. Set backend env vars:
   - `PORT=3001` (or provider default)
   - `NEW_API_KEY=...` (NewsAPI)
5. Confirm health endpoint:
   - `GET https://<backend-domain>/api/health`

## 2) Deploy Frontend to Vercel
1. Import repo to Vercel.
2. Set project root to `wavelength-frontend`.
3. Framework preset: Vite.
4. Add env var in Vercel:
   - `VITE_API_BASE_URL=https://<backend-domain>/api`
5. Deploy.

## 3) CORS
Current backend uses open CORS (`app.use(cors())`).  
Before production hardening, restrict to your frontend domain only.

## 4) Data Persistence Note
Current backend uses `better-sqlite3` and local file DB.  
For production multi-user persistence, migrate to hosted DB and update DB layer accordingly.

# Wavelength Frontend (Vite)

## Local run
1. Install dependencies:
   - `npm install`
2. Configure environment:
   - copy `.env.example` to `.env`
   - set `VITE_API_BASE_URL` (for local backend use `http://localhost:3001/api`)
3. Start dev server:
   - `npm run dev`

## Build

- `npm run build`
- `npm run preview`

## Notes

- API base URL is read from `VITE_API_BASE_URL`.
- If unset, frontend falls back to `http://localhost:3001/api`.

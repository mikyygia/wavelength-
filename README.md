## Inspiration
Wavelength started from a simple observation: campus life is full of people and somehow still lonely. Students walk the same paths every day without knowing how people around them are feeling or whether something nearby actually warrants concern. Most safety apps feel reactive and clinical. 

What if a map could carry both the emotional and safety pulse of an area in real time, without the friction of traditional reporting apps? Something immediate and human, where community signals and local context live together in one place.

## What it does
- drop anonymous mood signals on a map
- post local safety/static incident reports
- react to signals
- view a live activity feed filtered by selected location and radius
- track area mood + tension summaries
- see local crime-related news context in the security panel

It’s designed to quickly answer: “What’s happening around this area right now?”

## How we built it
**Frontend:**
- React
- Vite
- Leaflet.js + OpenStreetMap
- Axios
- Custom hooks for signals, reports, geocoding, map state, theming, and accessibility
**Backend:**
- Node.js + Express (ES Modules)
- REST routes for signals, static reports, reactions, news aggregation, and geospatial filtering
Database: SQLite via better-sqlite3 for fast local persistence
**Deployment:**
- Render (backend)
- Vercel (frontend)
- Environment-based API routing with browser-side local history and cache handling.

## Challenges we ran into
Data source pivots. The original plan was live local crime data, but finding a reliable API with real incident data filterable by coordinates proved harder than expected and the privacy implications wasn't what I wanted to focus on.  After exploring CityProtect, SpotCrime, and the FBI Crime Data API, I pivoted to NewsAPI for crime-adjacent headlines. It turned out to be a better fit as real headlines are more readable and trustworthy for a general user than raw incident records.

**Other challenges:**
- Deployment issues with native SQLite bindings (better-sqlite3) across environments
- Keeping UX coherent when location/radius changes affected multiple panels.
- Sync consistency bugs, like deleting in history not immediately reflecting in activity/map views.
- Noise in “crime news” relevance when generic news results slipped through.

## Accomplishments that we're proud of
- Built a location-aware, radius-based community pulse product end-to-end and the location is fully dynamic, so it works for any location, not just UCI.
- Shipped a working map + feed + reporting workflow with live interactions
- Improved reliability and UX by fixing state sync and empty-state behavior
- Successfully deployed a two-service architecture (Vercel + Render)

## What we learned
- Small API/UX error-handling decisions can dramatically affect perceived reliability
- Geospatial products need strict consistency across data hooks and UI layers
- Local cache/state can drift from backend truth unless explicitly designed to stay in sync
- Some bugs only reveal themselves through real user flows, not isolated testing

## What's next for wavelength
- Better onboarding and clearer metric explainability
- Account authentication for user identity + trust layers (ownership, moderation, anti-spam)
- Better relevance/ranking for local crime/safety news
- AI chatbot, the chat interface is already built. A user should be able to ask "is it safe near the library right now?" and get a answers grounded in actual and/or live data.

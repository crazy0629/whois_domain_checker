# TLV300 Whois Domain Checker

Stack: React (Vite + TS), Python (FastAPI), MongoDB.

Run locally (no Docker):
1) Backend (Python FastAPI)
   - cd backend
   - python -m venv .venv
   - .venv\Scripts\activate (Windows)
   - pip install -r requirements.txt
   - copy .env.example to .env and set WHOIS_API_KEY
   - uvicorn app.main:app --port 5000
   - Health: http://localhost:5000/health

2) MongoDB
   - Ensure a local MongoDB is running (default: mongodb://localhost:27017)
   - Or set MONGODB_URI in backend/.env

3) Frontend (React)
   - cd frontend
   - npm install
   - npm run dev (http://localhost:5173)

API:
- GET /api/whois/:domain?type=domain|contact
- GET /api/history

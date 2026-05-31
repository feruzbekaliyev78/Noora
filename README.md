# NOORA — AI Skin Analysis PWA

PWA-приложение для анализа кожи через Gemini Vision.

## Структура

```
noora/
├── frontend/   # React + Vite PWA
└── backend/    # Node.js + Express + Gemini
```

## Быстрый старт

### Backend

```bash
cd backend
cp .env.example .env
# Добавь GEMINI_API_KEY в .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend проксирует `/api` на `localhost:3000`.

## ENV

**backend/.env**
- `GEMINI_API_KEY` — ключ Google AI (только на сервере!)
- `PORT` — порт (по умолчанию 3000)

**frontend/.env**
- `VITE_API_URL` — URL бэкенда (Railway)
- `VITE_FIREBASE_*` — Firebase Firestore (опционально)

## Деплой

- **Backend** → Railway
- **Frontend** → Vercel

## Языки

RU / UZ — переключатель в правом верхнем углу на экране онбординга.

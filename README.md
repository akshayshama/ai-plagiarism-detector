<p align="center">
  <img src="https://img.shields.io/badge/AI%20Code%20Plagiarism%20Detector-7C5CFF?style=for-the-badge" alt="Project badge" />
</p>

# AI Code Plagiarism Detector

A hybrid plagiarism & AI-generation detection engine. Drop in two code files and get a forensic verdict — fusing **RoBERTa linguistic forensics** with **semantic fingerprinting** entirely on your machine. No cloud uploads, no API keys.

## Features

- **Dual-model forensics** — `Hello-SimpleAI/chatgpt-detector-roberta` scores the probability each file is AI-generated, while `sentence-transformers/all-MiniLM-L6-v2` (a lightweight ~90 MB model) fingerprints semantic similarity between the two files — fast enough to run instantly on CPU.
- **Fused verdicting** — independent thresholds (60% AI-risk, 75% semantic match) combine into a single per-file verdict plus an overall pass/fail verdict.
- **Micro-interaction UI** — letter-by-letter animated title, drag-and-drop with scanline feedback, full-screen scanning overlay with a 4-step pipeline readout, and spring-animated gauges and progress bars.
- **Runs fully local** — CUDA-accelerated when available, CPU fallback otherwise; files never leave your machine.
- **CSV export** — the backend can return the same report as a downloadable CSV stream.

## Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-4A4A55?style=for-the-badge&logo=lucide&logoColor=white)

### Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Sentence Transformers](https://img.shields.io/badge/Sentence_Transformers-2F6FDF?style=for-the-badge)
![CUDA](https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white)

## Project Structure

```
ai-plagiarism-detector/
├── backend/                    # FastAPI analysis engine (port 8000)
│   ├── app.py                  # API, model loading, AI + semantic pipelines
│   └── requirements.txt
└── frontend/                   # React + Vite + Tailwind UI (port 5174)
    ├── src/
    │   ├── App.tsx             # Upload → analyze → results state machine
    │   ├── api.ts              # FastAPI client (multipart upload)
    │   ├── types.ts
    │   └── components/
    │       ├── NeonTitle.tsx           # Letter-by-letter animated title
    │       ├── FileDropzone.tsx        # Drag & drop with rejection shake
    │       ├── AnalyzingOverlay.tsx    # Full-screen scan pipeline overlay
    │       ├── ScoreGauge.tsx          # Animated SVG gauges
    │       ├── ResultsDashboard.tsx    # Verdict + per-file breakdown
    │       └── AnimatedBackground.tsx  # Cyber grid + drifting orbs
    ├── index.html
    ├── package.json
    ├── vite.config.ts           # Proxies /api to the backend
    └── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### 1. Backend (terminal 1)

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

> The first startup downloads the RoBERTa and MiniLM models from Hugging Face (~600 MB total). Analysis runs on GPU when CUDA is available, otherwise on CPU — the default models are fast enough to run instantly on CPU.

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5174`. Vite proxies `/api` to the backend on port `8000`.

> **Note:** `localhost` URLs only work when you run the project on your own machine — they are not live links. To share a working URL, deploy the app using the guides below.

## Live Demo & Deployment

The app has **no cloud-hosted live demo** because the ML models run locally and files never leave the machine. To get a shareable URL, deploy the two halves yourself:

### Frontend → Vercel (recommended)

```bash
cd frontend
npm run build
```

Then in the Vercel dashboard: **Add New → Project → Import** this repo, set
**Root Directory** to `frontend`, and add the build command `npm run build` with
output directory `dist`.

### Frontend → GitHub Pages

1. In `frontend/vite.config.ts`, add `base: '/<your-repo-name>/'`.
2. In the repo: **Settings → Pages → Deploy from a branch → main → `/frontend`** (or push `frontend/dist` to a `gh-pages` branch).

### Backend → Render / Railway

The backend models are ~600 MB by default, so pick a host with enough disk:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

- **Render:** Web Service → point at this repo, root directory `backend`,
  build command `pip install -r requirements.txt`, start command
  `uvicorn app:app --host 0.0.0.0 --port $PORT`.
- **Railway:** add the same service with root directory `backend`; Railway
  injects `PORT`, which FastAPI reads above.

Then point the frontend at the deployed backend by setting an env var when
building the frontend:

```bash
VITE_API_URL=https://your-backend.onrender.com npm run build
```

### Production (single server)

```bash
cd frontend
npm run build
cd ../backend
uvicorn app:app --host 0.0.0.0 --port 8000
```

## API Endpoints

| Method | Path                        | Description                                              |
| ------ | --------------------------- | -------------------------------------------------------- |
| GET    | `/ping`                     | Health check + model load status                         |
| POST   | `/api/analyze_submissions`  | Multipart upload of exactly 2 files → JSON verdict       |
| POST   | `/api/analyze_submissions?format=csv` | Same analysis, returned as a CSV download      |

### Response shape

```json
{
  "overall_verdict": "PLAGIARISM DETECTED (One or both files are AI-generated)",
  "file_results": [
    {
      "filename": "a.py",
      "ai_probability": 0.93,
      "is_ai_plagiarism": true,
      "semantic_score": 0.81,
      "verdict": "PLAGIARISM (High AI Prob)"
    },
    {
      "filename": "b.py",
      "ai_probability": 0.11,
      "is_ai_plagiarism": false,
      "semantic_score": 0.81,
      "verdict": "ORIGINAL"
    }
  ],
  "semantic_similarity_score_A_B": 0.81
}
```

## Thresholds

| Check             | Flag when            | Model                                  |
| ----------------- | -------------------- | -------------------------------------- |
| AI generation     | probability > 60%    | `chatgpt-detector-roberta`             |
| Cross-file match  | similarity > 75%     | `all-MiniLM-L6-v2` cosine similarity  |

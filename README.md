# AI Code Plagiarism Detector

A hybrid plagiarism & AI-generation detection tool. Upload two code files and get a forensic verdict powered by two models running locally:

- **RoBERTa** (`Hello-SimpleAI/chatgpt-detector-roberta`) — linguistic AI-generation probability
- **BGE** (`BAAI/bge-large-en-v1.5`) — semantic similarity fingerprinting between the two files

Built with a FastAPI backend and a dark cyber-themed React frontend with professional micro-interactions.

## Project structure

```
ai-plagiarism-detector/
├── backend/            # FastAPI analysis engine (port 8000)
│   ├── app.py
│   └── requirements.txt
└── frontend/           # React + Vite + Tailwind UI (port 5174)
    ├── src/
    ├── index.html
    └── package.json
```

## Getting started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

> First startup downloads the RoBERTa and BGE models from Hugging Face (~2 GB total). Analysis runs on GPU if CUDA is available, otherwise CPU.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5174 — the frontend proxies `/api` requests to the backend on port 8000 automatically.

## API

| Method | Endpoint                      | Description                                     |
| ------ | ----------------------------- | ----------------------------------------------- |
| GET    | `/ping`                       | Health check + model load status                |
| POST   | `/api/analyze_submissions`    | Multipart upload of exactly 2 files → JSON verdict |

### Response shape

```json
{
  "overall_verdict": "PLAGIARISM DETECTED (...) | ORIGINAL (All Checks Passed)",
  "file_results": [
    { "filename": "a.py", "ai_probability": 0.93, "is_ai_plagiarism": true, "semantic_score": 0.81, "verdict": "PLAGIARISM (High AI Prob)" },
    { "filename": "b.py", "ai_probability": 0.11, "is_ai_plagiarism": false, "semantic_score": 0.81, "verdict": "ORIGINAL" }
  ],
  "semantic_similarity_score_A_B": 0.81
}
```

## Thresholds

- AI probability > **60%** → flagged as AI-generated
- Semantic similarity > **75%** → flagged as cross-file match

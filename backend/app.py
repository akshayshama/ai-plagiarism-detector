# app.py - Final FastAPI Backend with Double-Hybrid Model and CSV Download

import os
import ast
import difflib
from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from sentence_transformers import SentenceTransformer, util
from typing import List, Dict, Any, Optional
import warnings
import csv
import io
import json

# Suppress Hugging Face warnings during model loading for a cleaner console
warnings.filterwarnings("ignore")

app = FastAPI(title="AI Plagiarism Detector Core Engine (RoBERTa Semantic)")

# --- 1. CORS Setup ---
# Browsers reject "*" combined with credentials, so allow an explicit origin list.
# Override in production with a comma-separated list, e.g.:
#   ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5174").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global exception handler: return real error as JSON, never a blank 500 ---


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import traceback

    traceback.print_exc()
    return JSONResponse(
        status_code=500, content={"detail": f"{type(exc).__name__}: {exc}"}
    )


# --- 2. GLOBAL MODEL SETUP ---
# Small/fast defaults (override with env vars, e.g. SEMANTIC_MODEL_NAME=BAAI/bge-large-en-v1.5)
AI_MODEL_NAME = os.environ.get(
    "AI_MODEL_NAME", "Hello-SimpleAI/chatgpt-detector-roberta"
)
SEMANTIC_MODEL_NAME = os.environ.get(
    "SEMANTIC_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

AI_PLAGIARISM_THRESHOLD = 0.60
SEMANTIC_PLAGIARISM_THRESHOLD = 0.75
STRUCTURAL_PLAGIARISM_THRESHOLD = 0.80

AI_TOKENIZER, AI_MODEL, SEMANTIC_MODEL = None, None, None


@app.on_event("startup")
def load_models():
    """Load small models only once when the application starts."""
    global AI_TOKENIZER, AI_MODEL, SEMANTIC_MODEL
    try:
        print(f"Loading models on device: {DEVICE}")

        # 1. Load AI Detection Model (RoBERTa For Classification)
        AI_TOKENIZER = AutoTokenizer.from_pretrained(AI_MODEL_NAME)
        AI_MODEL = AutoModelForSequenceClassification.from_pretrained(
            AI_MODEL_NAME, low_cpu_mem_usage=True
        ).to(DEVICE)

        # 2. Load Semantic Similarity Model (small MiniLM / SentenceTransformer)
        SEMANTIC_MODEL = SentenceTransformer(SEMANTIC_MODEL_NAME, device=DEVICE)
        print("All models loaded successfully.")
    except Exception as e:
        print(
            f"FATAL ERROR: Could not load required models. Analysis will be disabled. Error: {e}"
        )
        AI_TOKENIZER, AI_MODEL, SEMANTIC_MODEL = None, None, None


# --- 3. Core Analysis Functions ---


def predict_ai_probability(text: str) -> float:
    """Predicts the probability that the text is AI-generated (0.0 to 1.0)."""
    if AI_MODEL is None:
        return 0.5

    inputs = AI_TOKENIZER(
        text, return_tensors="pt", truncation=True, padding=True, max_length=512
    )
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = AI_MODEL(**inputs)

    probabilities = torch.softmax(outputs.logits, dim=1)
    return probabilities[0][1].item()


def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """Calculates semantic similarity between two texts using the BGE model."""
    if SEMANTIC_MODEL is None:
        return 0.0

    with torch.no_grad():
        emb1 = SEMANTIC_MODEL.encode(text1, convert_to_tensor=True).to(DEVICE)
        emb2 = SEMANTIC_MODEL.encode(text2, convert_to_tensor=True).to(DEVICE)

    similarity = util.cos_sim(emb1.unsqueeze(0), emb2.unsqueeze(0)).item()
    return similarity


def _flatten_ast(code: str) -> Optional[List[str]]:
    """Parse Python source and flatten it into a list of AST node-type names.

    Identifier names (variables/functions) are intentionally dropped so that
    renaming doesn't defeat the comparison — only the shape of the tree is kept.
    Returns None if the code is not valid Python.
    """
    try:
        tree = ast.parse(code)
    except (SyntaxError, ValueError):
        return None

    sequence = []

    def walk(node):
        sequence.append(type(node).__name__)
        for child in ast.iter_child_nodes(node):
            walk(child)

    walk(tree)
    return sequence


def calculate_structural_similarity(code1: str, code2: str) -> Optional[float]:
    """Compares the structural (AST) shape of two Python files.

    Uses difflib.SequenceMatcher over the flattened AST node-type sequences of
    both files and returns a similarity score in [0.0, 1.0]. Returns None when
    either file cannot be parsed as Python, so callers can report that
    structural analysis was not applicable instead of returning a misleading
    score.
    """
    seq1 = _flatten_ast(code1)
    seq2 = _flatten_ast(code2)
    if seq1 is None or seq2 is None:
        return None
    if not seq1 and not seq2:
        return 1.0
    if not seq1 or not seq2:
        return 0.0
    return round(difflib.SequenceMatcher(None, seq1, seq2).ratio(), 4)


def generate_csv_report(results: List[Dict[str, Any]]) -> io.StringIO:
    """Converts the list of result dictionaries into an in-memory CSV file stream."""

    fieldnames = [
        "filename",
        "verdict",
        "ai_probability",
        "semantic_score",
        "structural_score",
        "is_ai_plagiarism",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)

    writer.writeheader()

    for row in results:
        writer.writerow(
            {
                "filename": row["filename"],
                "verdict": row["verdict"],
                "ai_probability": row["ai_probability"],
                "semantic_score": row["semantic_score"],
                "structural_score": row["structural_score"],
                "is_ai_plagiarism": row["is_ai_plagiarism"],
            }
        )

    output.seek(0)
    return output


# --- 4. ENDPOINTS ---


@app.get("/ping")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "AI Detector v2 (RoBERTa Semantic)",
        "ai_model_loaded": AI_MODEL is not None,
        "semantic_model_loaded": SEMANTIC_MODEL is not None,
    }


@app.post("/api/analyze_submissions")
async def analyze_submissions(
    files: list[UploadFile] = File(...), format: str = Form("json")
):
    """
    Analyzes exactly two uploaded files for AI generation probability, semantic
    similarity, and AST-based structural similarity, returning results as JSON
    or a downloadable CSV file.
    """
    if len(files) != 2:
        raise HTTPException(
            status_code=400, detail="Must upload exactly 2 files for comparison."
        )

    if AI_MODEL is None or SEMANTIC_MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="AI and Semantic models are not loaded. Check server logs.",
        )

    # 1. Read Contents
    contents = []
    filenames = []
    for f in files:
        try:
            content = await f.read()
            contents.append(content.decode("utf-8"))
            filenames.append(f.filename)
        except Exception:
            raise HTTPException(
                status_code=500,
                detail=f"Could not read/decode file: {f.filename}. Ensure it's a plain text/code file.",
            )

    # 2. Run Analysis
    results = []
    semantic_score = calculate_semantic_similarity(contents[0], contents[1])

    # Structural (AST) comparison — only applicable when both files parse as Python
    structural_score = calculate_structural_similarity(contents[0], contents[1])
    structural_note = None
    if structural_score is None:
        structural_note = (
            "Structural analysis not applicable: at least one file is not valid Python."
        )

    for i in range(2):
        text_content = contents[i]

        # AI Detection
        ai_probability = predict_ai_probability(text_content)
        is_ai_generated = ai_probability > AI_PLAGIARISM_THRESHOLD

        # Semantic similarity (shared by both files)
        is_high_semantic_match = semantic_score > SEMANTIC_PLAGIARISM_THRESHOLD

        # Structural similarity (shared by both files, when applicable)
        is_high_structural_match = (
            structural_score is not None
            and structural_score > STRUCTURAL_PLAGIARISM_THRESHOLD
        )

        # Flag the file whenever plagiarism is detected for ANY reason
        # (AI-generated OR high semantic match OR high structural match).
        is_flagged_plagiarism = (
            is_ai_generated or is_high_semantic_match or is_high_structural_match
        )

        # Determine Verdict (list every signal that triggered)
        triggers = []
        if is_ai_generated:
            triggers.append("High AI Prob")
        if is_high_semantic_match:
            triggers.append("High Semantic Match")
        if is_high_structural_match:
            triggers.append("High Structural Match")

        verdict = "ORIGINAL"
        if triggers:
            verdict = f"PLAGIARISM ({', '.join(triggers)})"

        results.append(
            {
                "filename": filenames[i],
                "ai_probability": round(ai_probability, 4),
                "is_ai_plagiarism": is_flagged_plagiarism,
                "semantic_score": round(semantic_score, 4),
                "structural_score": structural_score,
                "structural_note": structural_note,
                "verdict": verdict,
            }
        )

    # 3. Determine Overall Verdict
    # NOTE: is_ai_plagiarism means "flagged for any reason", so re-derive each
    # signal check here to keep the verdict strings accurate.
    overall_reasons = []
    if any(r["ai_probability"] > AI_PLAGIARISM_THRESHOLD for r in results):
        overall_reasons.append("One or both files are AI-generated")
    if semantic_score > SEMANTIC_PLAGIARISM_THRESHOLD:
        overall_reasons.append("High semantic match between the two files")
    if (
        structural_score is not None
        and structural_score > STRUCTURAL_PLAGIARISM_THRESHOLD
    ):
        overall_reasons.append("High structural match between the two files")

    overall_verdict = "ORIGINAL (All Checks Passed)"
    if overall_reasons:
        overall_verdict = "PLAGIARISM DETECTED (" + "; ".join(overall_reasons) + ")"

    # --- 4. Return Response ---

    if format.lower() == "csv":
        csv_stream = generate_csv_report(results)
        headers = {
            "Content-Disposition": 'attachment; filename="plagiarism_report.csv"'
        }
        return StreamingResponse(csv_stream, headers=headers, media_type="text/csv")

    # Default: Return JSON response
    final_response = {
        "overall_verdict": overall_verdict,
        "file_results": results,
        "semantic_similarity_score_A_B": round(semantic_score, 4),
    }
    return JSONResponse(content=final_response)

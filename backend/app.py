"""
FastAPI application for OpenEnv Data Pipeline Triage & Repair environment.
Exposes all required endpoints for agent evaluation.

Environment Variables:
    HF_TOKEN (optional): HuggingFace token for authenticated endpoints
    API_BASE_URL (optional): Base URL for the environment server (default: http://localhost:7860)
    MODEL_NAME (optional): OpenAI model to use (default: gpt-4o-mini)
"""

import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from models import (
    Action, Observation, Reward, GraderResult, TasksResponse,
    TaskInfo, BaselineResult, StepResponse
)
from environment import DataPipelineEnvironment


HF_TOKEN = os.environ.get("HF_TOKEN")
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:7860")
MODEL_NAME = os.environ.get("MODEL_NAME", "gpt-4o-mini")


class ResetRequest(BaseModel):
    task_id: str | None = None


class StepRequest(BaseModel):
    action: Action


class BaselineRequest(BaseModel):
    model: str = MODEL_NAME


env = DataPipelineEnvironment(seed=42)

baseline_scores: dict[str, float] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize environment on startup."""
    env.reset("fix_null_values")
    yield


app = FastAPI(
    title="Data Pipeline Triage & Repair Environment",
    description="OpenEnv-compliant environment for AI agent evaluation in data pipeline repair tasks",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root() -> dict[str, Any]:
    """Health check endpoint for HF Space deployment."""
    return {
        "status": "ok",
        "message": "Data Pipeline Triage & Repair Environment",
        "version": "1.0.0",
        "config": {
            "hf_token": "set" if HF_TOKEN else None,
            "api_base_url": API_BASE_URL,
            "model_name": MODEL_NAME
        }
    }


@app.get("/config", tags=["Info"])
async def get_config() -> dict[str, Any]:
    """Get current configuration from environment variables."""
    return {
        "hf_token": "set" if HF_TOKEN else None,
        "api_base_url": API_BASE_URL,
        "model_name": MODEL_NAME,
        "port": int(os.environ.get("PORT", "7860")),
        "host": os.environ.get("HOST", "0.0.0.0")
    }


@app.post("/reset", response_model=Observation, tags=["Environment"])
async def reset_environment(request: ResetRequest | None = None) -> Observation:
    """
    Reset the environment to initial state.
    
    Args:
        request: Optional reset request with task_id
        
    Returns:
        Initial observation
    """
    task_id = request.task_id if request else None
    observation = env.reset(task_id)
    return observation


@app.post("/step", response_model=StepResponse, tags=["Environment"])
async def step_environment(request: StepRequest) -> StepResponse:
    """
    Execute one step in the environment.
    
    Args:
        request: Step request containing the action
        
    Returns:
        Step response with observation, reward, and status
    """
    try:
        observation, reward, terminated, info = env.step(request.action)
        
        return StepResponse(
            observation=observation,
            reward=reward,
            terminated=terminated,
            truncated=observation.step >= observation.max_steps,
            info=info
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/state", tags=["Environment"])
async def get_state() -> dict[str, Any]:
    """
    Get the current underlying state.
    
    Returns:
        Dictionary representing current environment state
    """
    return env.state()


@app.get("/grader", response_model=GraderResult, tags=["Evaluation"])
async def get_grader_score() -> GraderResult:
    """
    Get the final grader score after episode completion.
    
    Returns:
        Grader result with score and detailed metrics
    """
    return env.grade()


@app.get("/tasks", response_model=TasksResponse, tags=["Info"])
async def get_tasks() -> TasksResponse:
    """
    Get list of all tasks and the action schema.
    
    Returns:
        Tasks response with task list and action schema
    """
    tasks = env.get_tasks()
    action_schema = env.get_action_schema()
    
    task_infos = [
        TaskInfo(
            task_id=task_id,
            name=task_info.name,
            description=task_info.description,
            difficulty=task_info.difficulty,
            max_steps=task_info.max_steps,
            evaluation_criteria=task_info.evaluation_criteria
        )
        for task_id, task_info in tasks.items()
    ]
    
    return TasksResponse(
        tasks=task_infos,
        action_schema=action_schema
    )


@app.post("/baseline", response_model=BaselineResult, tags=["Evaluation"])
async def run_baseline(request: BaselineRequest | None = None) -> BaselineResult:
    """
    Trigger the baseline inference and return scores for all 3 tasks.
    
    Note: This runs a simple heuristic baseline. For full OpenAI-based
    baseline, use the separate baseline.py script.
    
    Args:
        request: Optional baseline request with model specification
        
    Returns:
        Baseline result with scores for all tasks
    """
    global baseline_scores
    
    try:
        baseline_scores = env.run_baseline()
        
        total_score = sum(baseline_scores.values())
        average_score = total_score / len(baseline_scores) if baseline_scores else 0.0
        
        return BaselineResult(
            task_results=baseline_scores,
            average_score=average_score,
            total_score=total_score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Baseline execution failed: {str(e)}")


@app.get("/metrics", tags=["Info"])
async def get_metrics() -> dict[str, Any]:
    """Get current environment metrics."""
    state = env.state()
    
    return {
        "current_task": state.get("current_task_id"),
        "step": state.get("step"),
        "max_steps": state.get("max_steps"),
        "repair_progress": state.get("repair_progress"),
        "schema_fixed": state.get("schema_fixed"),
        "corruption_cleared": state.get("corruption_cleared"),
        "actions_taken": state.get("actions_taken"),
        "episode_complete": state.get("episode_complete")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

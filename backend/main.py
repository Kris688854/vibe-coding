"""FastAPI 主入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import api

app = FastAPI(
    title="健身工具 API",
    description="肌肉训练动作3D可视化系统的后端API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api", tags=["健身数据"])

@app.get("/")
async def root():
    return {"message": "健身工具 API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import songs

app = FastAPI(
    title="Thiruppugazh Search API",
    description="API server for querying Thiruppugazh songs, lyrics, places, and chandam patterns.",
    version="1.0.0"
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(songs.router)

@app.get("/")
def root():
    return {"message": "Welcome to Thiruppugazh API", "docs": "/docs"}

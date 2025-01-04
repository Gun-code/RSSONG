# main.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles  # StaticFiles 임포트
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    savedMyCard,
    textToVoice,
    similarity,
    objectDetection,
    audio,
    translation,
    dbtest,
    # 다른 라우터가 있다면 여기에 추가
)

app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:3000",        # React 개발 서버
    "http://192.168.0.129:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://localhost:8000/docs/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # 허용할 출처
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 설정
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 라우터 포함
app.include_router(textToVoice.router)
app.include_router(similarity.router)
app.include_router(objectDetection.router)
app.include_router(audio.router)
app.include_router(translation.router)
app.include_router(dbtest.router)
app.include_router(savedMyCard.router)  # savedMyCard 라우터 추가

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

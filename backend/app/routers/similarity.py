# app/routers/similarity.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.similarity import compare_audio_files
import os
import shutil
from pydub import AudioSegment  # 필요 시 추가
import librosa
import numpy as np

router = APIRouter()

# 업로드 파일 저장 디렉토리
UPLOAD_DIR = "app/static/"

@router.post("/similarity/")
async def similarity(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    """
    두 음성 파일을 비교하여 유사도를 계산합니다.
    """
    try:

        
        print("파일1 이름:", file1.filename)
        print("파일1 타입:", file1.content_type)
        print("파일2 이름:", file2.filename)
        print("파일2 타입:", file2.content_type)

        file1_path = os.path.join(UPLOAD_DIR, file1.filename)
        file2_path = os.path.join(UPLOAD_DIR, file2.filename)

        # 파일 저장
        with open(file1_path, "wb") as f1, open(file2_path, "wb") as f2:
            shutil.copyfileobj(file1.file, f1)
            shutil.copyfileobj(file2.file, f2)

        # 유사도 계산
        similarity = compare_audio_files(file1_path, file2_path)

        # 저장된 파일 삭제
        os.remove(file1_path)
        os.remove(file2_path)

        # 반환값은 Python의 기본 타입
        return {"similarity": similarity}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"오류 발생: {str(e)}")
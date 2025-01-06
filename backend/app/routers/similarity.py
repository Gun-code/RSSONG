from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.similarity import compare_audio_files
import os
import shutil
from pydub import AudioSegment
import logging

router = APIRouter()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 업로드 파일 저장 디렉토리
UPLOAD_DIR = os.path.join(os.getcwd(), "app", "static")


@router.post("/similarity/")
async def similarity(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    try:
        logger.info(f"파일1 이름: {file1.filename}, 타입: {file1.content_type}")
        logger.info(f"파일2 이름: {file2.filename}, 타입: {file2.content_type}")

        # 업로드 디렉토리가 없으면 생성
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file1_path = os.path.join(UPLOAD_DIR, file1.filename)
        file2_path = os.path.join(UPLOAD_DIR, file2.filename)

        # 파일 저장
        with open(file1_path, "wb") as f1:
            shutil.copyfileobj(file1.file, f1)
        with open(file2_path, "wb") as f2:
            shutil.copyfileobj(file2.file, f2)

        # 파일 존재 여부 확인
        if not os.path.exists(file1_path):
            logger.error(f"파일1이 저장되지 않았습니다: {file1_path}")
            raise HTTPException(status_code=400, detail=f"파일1이 저장되지 않았습니다: {file1_path}")
        if not os.path.exists(file2_path):
            logger.error(f"파일2가 저장되지 않았습니다: {file2_path}")
            raise HTTPException(status_code=400, detail=f"파일2가 저장되지 않았습니다: {file2_path}")

        # 파일 형식 결정 (확장자에서 '.'을 제외하고 소문자로 변환)
        file1_format = os.path.splitext(file1.filename)[1][1:].lower()
        file2_format = os.path.splitext(file2.filename)[1][1:].lower()

        # 파일 변환 함수
        def convert_to_wav(input_path, output_path, input_format):
            try:
                audio = AudioSegment.from_file(input_path, format=input_format)
                audio.export(output_path, format="wav")
                logger.info(f"{input_path}를 {output_path}로 변환 완료.")
            except Exception as e:
                logger.error(f"오디오 파일 변환 실패: {e}")
                raise ValueError(f"오디오 파일 변환 실패: {e}")

        wav_file1_path = os.path.splitext(file1_path)[0] + "_converted.wav"
        wav_file2_path = os.path.splitext(file2_path)[0] + "_converted.wav"

        # 파일 변환
        convert_to_wav(file1_path, wav_file1_path, file1_format)
        convert_to_wav(file2_path, wav_file2_path, file2_format)

        # 유사도 계산
        similarity = compare_audio_files(wav_file1_path, wav_file2_path)
        logger.info(f"유사도 계산 결과: {similarity}")

        # 저장된 파일 삭제
        os.remove(file1_path)
        os.remove(file2_path)
        os.remove(wav_file1_path)
        os.remove(wav_file2_path)

        return {"similarity": similarity}
    except Exception as e:
        logger.error(f"Similarity 엔드포인트 오류: {e}")
        raise HTTPException(status_code=400, detail=f"오류 발생: {str(e)}")

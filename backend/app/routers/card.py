# 객체 감지
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.objectDetection import detect_objects
import os
import shutil
# 번역
from fastapi import APIRouter, Query, HTTPException
from app.services.translation import translate_text, translate_lang
# voice 파일 생성
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from app.services.textToVoice import generate_tts
# zip 파일 생성
from fastapi.responses import StreamingResponse
from io import BytesIO
import zipfile

router = APIRouter()

# 업로드 이미지 저장 경로
UPLOAD_DIR = "../database/images/"

@router.post("/scan/")
async def scan_in_image(file: UploadFile = File(...), lang: str = str):
    """
    이미지에서 객체 감지
    :param file: 업로드된 이미지
    :return: 감지된 객체 이름
    """
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    try:
        # 업로드 파일 저장 
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # 파일 스트림 명시적으로 닫기
        await file.close()
        
        # 이미지 처리
        detected_object = detect_objects(file_path)

        # 확장자 추출
        file_extension = os.path.splitext(file.filename)[1]  # 예: ".jpg", ".png"

        # 이미지 파일이름 변경
        os.rename(file_path, file_path.replace(file.filename, f"{detected_object}{file_extension}"))

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except PermissionError:
        raise HTTPException(
            status_code=500,
            detail="파일을 삭제할 수 없습니다. 다른 프로세스가 파일을 사용 중입니다."
        )
    
    # 번역
    kor = translate_text(detected_object, dest_lang='ko')
    if lang != 'en':
        if lang == 'ch':
            lang = 'zh-cn'
        elif lang == 'jp':
            lang = 'ja'
            
    trans = detected_object
    if lang != 'en':
        trans = translate_lang(detected_object, dest_lang=lang)

    # 음성 파일 생성  - 한국어

    kor_audio, trans_audio = None, None
    try:
        file_path = generate_tts(text=kor, lang='ko', file_name="kor.mp3")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # 음성 파일 생성  - 번역
    try:
        file_path = generate_tts(text=trans, lang=lang, file_name="trans.mp3")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # zip 파일 생성
    path = "app/static/"
    kor_audio = os.path.join(path, "kor.mp3")
    trans_audio = os.path.join(path, "trans.mp3")

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zf:
        # 텍스트 파일 추가
        zf.writestr("kor.txt", kor)
        zf.writestr("trans.txt", trans)

        # 음성 파일 추가 (파일 데이터를 읽어서 추가)
        with open(kor_audio, "rb") as audio_file:
            zf.writestr("kor.mp3", audio_file.read())
        with open(trans_audio, "rb") as audio_file:
            zf.writestr("trans.mp3", audio_file.read())

    # zip 파일 반환
    zip_buffer.seek(0)
    return StreamingResponse(zip_buffer, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=audio.zip"})
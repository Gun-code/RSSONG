// frontend/src/components/SavedMyCard.jsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

import Modal from 'react-modal';
import '../css/savedMycard.css'; // 수정된 CSS 파일 임포트
import logo from '../images/logo.svg';

Modal.setAppElement('#root'); // 접근성을 위해 필요

// 환경 변수에서 백엔드 URL을 가져옵니다.
// .env 파일에 REACT_APP_BACKEND_URL을 설정해야 합니다.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const SavedMyCard = () => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 단어의 인덱스
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [similarityResult, setSimilarityResult] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [userAudioBlob, setUserAudioBlob] = useState(null);

  useEffect(() => {
    fetchMyWords();
  }, []);

  const fetchMyWords = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/savedMyCard/mywords/`);
      console.log('Fetched words:', response.data.items); // 데이터 확인을 위한 로그 추가
      setWords(response.data.items);
    } catch (error) {
      console.error('Error fetching my words:', error);
      alert('단어를 불러오는 데 문제가 발생했습니다.');
    }
  };

  const playAudio = (url) => {
    if (!url) {
      console.error('No audio URL provided');
      return;
    }
    const audio = new Audio(url);
    audio.play().catch((err) => console.error('Audio playback error:', err));
  };

  const startRecording = () => {
    setRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();

        const audioChunks = [];
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          setUserAudioBlob(audioBlob);
        };
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        alert('마이크 접근에 문제가 있습니다.');
        setRecording(false);
      });
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleConfirm = async () => {
    const currentWord = words[currentIndex];
    if (!currentWord || !userAudioBlob) {
      alert('녹음된 음성이 없거나 단어가 선택되지 않았습니다.');
      return;
    }

    try {
      // TTS 음성 파일 가져오기
      const ttsResponse = await axios.get(`${BACKEND_URL}${currentWord.tts_en_url}`, {
        responseType: 'blob',
      });

      const ttsBlob = new Blob([ttsResponse.data], { type: 'audio/mpeg' });
      const ttsFile = new File([ttsBlob], 'tts_en.mp3', { type: 'audio/mpeg' });

      const userFile = new File([userAudioBlob], 'user_recording.mp3', { type: 'audio/mpeg' });

      const formData = new FormData();
      formData.append('file1', ttsFile);
      formData.append('file2', userFile);

      const response = await axios.post(`${BACKEND_URL}/savedMyCard/similarity/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSimilarityResult(response.data.similarity);
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error checking similarity:', error);
      alert('유사도 검사를 하는 중 오류가 발생했습니다.');
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      resetRecordingState();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      resetRecordingState();
    }
  };

  const resetRecordingState = () => {
    setRecording(false);
    setAudioURL('');
    setUserAudioBlob(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (words.length === 0) {
    return <div className="smc-saved-my-card"><h1>Saved My Words</h1><p>단어를 불러오는 중입니다...</p></div>;
  }

  const currentWord = words[currentIndex];

  return (
    <div className="smc-saved-my-card">
     {/* 홈 아이콘 */}
     <div className="home-icon">
        <Link to="/">
          <img src={logo} alt="home" />
        </Link>
      </div>
      <div className="smc-card">

        <div className="smc-image-container">
          <button className="smc-prev-button" onClick={handlePrevious} disabled={currentIndex === 0}>이전</button>
          <img
            src={`${BACKEND_URL}${currentWord.path}`} // 수정된 부분
            alt={currentWord.word}
            className="smc-main-img"
          />
          <button className="smc-next-button" onClick={handleNext} disabled={currentIndex === words.length - 1}>다음</button>
        </div>

        <div className="smc-record-section">
          <button onClick={startRecording} disabled={recording} className="smc-record-start-btn">
            {recording ? '녹음 중...' : '🔴 녹음 시작'}
          </button>
          {recording && (
            <button onClick={stopRecording} className="smc-record-stop-btn">⏹️ 녹음 중지</button>
          )}
          {audioURL && (
            <>
              <audio src={audioURL} controls className="smc-audio-player" />
              <button onClick={handleConfirm} className="smc-confirm-btn">확인</button>
            </>
          )}
        </div>

        {/* 영어 단어와 한국어 단어를 클릭 시 음성 재생 */}
        <div className="result-container">
          <span
            className="object-en"
            onClick={() => playAudio(`${BACKEND_URL}${currentWord.tts_en_url}`)}
          >
            {currentWord.word}
          </span>
          <span
            className="object-ko"
            onClick={() => playAudio(`${BACKEND_URL}${currentWord.tts_ko_url}`)}
          >
            {currentWord.translated_text}
          </span>
        </div>
      </div>

      

      {/* 유사도 결과 모달 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Similarity Result"
        className="smc-modal"
        overlayClassName="smc-overlay"
      >
        <h2>유사도 결과</h2>
        <p>{similarityResult}</p>
        <button onClick={() => setModalIsOpen(false)} className="smc-close-modal-btn">닫기</button>
      </Modal>
    </div>
  );
};

export default SavedMyCard;

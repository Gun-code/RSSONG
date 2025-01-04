// frontend/src/components/SavedMyCard.jsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // 접근성을 위해 필요

// 환경 변수에서 백엔드 URL을 가져옵니다.
// .env 파일에 REACT_APP_BACKEND_URL을 설정해야 합니다.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const SavedMyCard = () => {
  const [words, setWords] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [similarityResult, setSimilarityResult] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [userAudioBlob, setUserAudioBlob] = useState(null);

  useEffect(() => {
    fetchMyWords();
  }, []);

  const fetchMyWords = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/savedMyCard/mywords/`);
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

  return (
    <div className="saved-my-card">
      <h1>Saved My Words</h1>
      <div className="cards-container">
        {words.map(word => (
          <div key={word.id} className="card">
            <h2>{word.word} / {word.translated_text}</h2>
            <div className="buttons">
              <button onClick={() => playAudio(`${BACKEND_URL}${word.tts_en_url}`)}>🔊 영어 듣기</button>
              <button onClick={() => playAudio(`${BACKEND_URL}${word.tts_ko_url}`)}>🔊 한국어 듣기</button>
            </div>
            <div className="record-section">
              <button onClick={() => { setCurrentWord(word); startRecording(); }} disabled={recording}>
                {recording && currentWord && currentWord.id === word.id ? '녹음 중...' : '🔴 녹음 시작'}
              </button>
              {recording && currentWord && currentWord.id === word.id && (
                <button onClick={stopRecording}>⏹️ 녹음 중지</button>
              )}
              {audioURL && currentWord && currentWord.id === word.id && (
                <>
                  <audio src={audioURL} controls />
                  <button onClick={handleConfirm}>확인</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Similarity Result"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>유사도 결과</h2>
        <p>{similarityResult}</p>
        <button onClick={() => setModalIsOpen(false)}>닫기</button>
      </Modal>
    </div>
  );
};

export default SavedMyCard;

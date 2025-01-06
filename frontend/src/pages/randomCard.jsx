import React, {useEffect, useState} from 'react';
import axios from 'axios';
import '../css/randomCard.css';
import Modal from 'react-modal';

Modal.setAppElement('#root'); //접근성을 위해 필요

// 환경 변수에서 백엔드 URL을 가져옵니다.
// .env 파일에 REACT_APP_BACKEND_URL을 설정해야 합니다.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

const RandomCard = () => {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0); 

    useEffect(() => {
        fetchAllWords();
    }, []);

    const fetchAllWords = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/allcard/`);
            console.log('Fetched words:', response.data.items); //데이터 확인 로그
            setWords(response.data.items);
        }catch(error){
            console.error('Error fetching my words:', error);
            alert(' 단어를 불러오는데 오류가 발생했습니다.');
        }
    };

    const currentWord = words[currentIndex] || {}; // 현재 단어 객체

    return(
        <div className = "RandomCard">
            <h1>Random Words</h1>
            <div calssName = "card">
                
                {/* 이미지 표시 섹션 추가 */}
                <div className="image-container">
                  <img
                    src={`${BACKEND_URL}${currentWord.path}`} // 수정된 부분
                    alt={currentWord.word}
                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                />
                </div>
            </div>

        </div>
    );
}
export default RandomCard;
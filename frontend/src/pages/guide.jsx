import React from "react";
import "../css/guide.css";
import camera from "../images/Cam.png";
import mic from "../images/record.svg";
import Logo from "../images/LOGO.png";
import { Link, useNavigate } from 'react-router-dom';

const Guide = () => {
  return (
    <div className="guide-container">
      <div className="guide-header">
      <Link to="/">
        <img src={Logo} alt="Logo"className="logo" />
        </Link>                   
      </div>

      <div className="guide-content">
        <h1 className="guide-title">
          <h1 className="alert-icon">!알쏭달쏭 이용 가이드</h1>
        </h1>

        <div className="guide-steps">
          <div className="step">
            <div className="step-number">
              1. <img src={camera} alt="카메라" className="camera-icon" />
              사물을 촬영하고
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              2. <span className="tag">한글</span>
              <span className="tag">영어</span> 단어/음성 확인
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              3. <img src={mic} alt="마이크" className="mic-icon" />
              누르고 발음을 확인해요
            </div>
          </div>

          <div className="step">
            <div className="step-number">4. 바로 찍어볼까요?</div>
          </div>
        </div>

        <div className="guide-buttons">
        <Link to="/">
          <button className="btn-no">아니</button>
        </Link>
          <Link to="/">
          <button className="btn-yes">응!</button>
        </Link> 
        </div>
      </div>
    </div>
  );
};

export default Guide;

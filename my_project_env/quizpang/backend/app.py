# app.py

import os
import json
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
# from google import genai
# from google.genai import types
import google.generativeai as genai
# from google.generativeai import types
# from google.genai.errors import APIError
from db import get_db_manager, db_manager # db_manager 전역 변수 임포트
from auth import auth_bp
from quiz import quiz_bp # 퀴즈 블루프린트 임포트
import atexit   
from flask_cors import CORS

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- 환경 설정 ---
# 1. Gemini API 키 (quiz.py에서 필요할 경우 사용)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. API 키를 설정해주세요.")

# 2. Flask 애플리케이션 초기화 및 CORS 설정
app = Flask(__name__)
# 프론트엔드(Vite 개발 서버)의 요청을 허용합니다.
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# 3. Gemini 클라이언트 초기화
try:
    if GEMINI_API_KEY:
        # client = genai.Client(api_key=GEMINI_API_KEY)
        genai.configure(api_key=GEMINI_API_KEY)
    else:
        client = None 
except Exception as e:
    logger.error(f"Gemini 클라이언트 초기화 실패: {e}")
    client = None

# 4. 데이터베이스 연결 관리자 초기화 (수정된 부분)
# NOTE: Flask 2.3+에서 'before_first_request'는 제거되었습니다.
# 앱 시작 시 DB 연결 및 테이블 생성을 보장하기 위해, 앱 컨텍스트를 사용하여 수동으로 호출합니다.
with app.app_context():
    get_db_manager()

# 5. 블루프린트 등록
app.register_blueprint(auth_bp, url_prefix='/api/auth') 
app.register_blueprint(quiz_bp) 

# 6. 앱 종료 시 DB 연결 해제
@atexit.register
def shutdown():
    if db_manager:
        db_manager.close()
        logger.info("Application shutting down: DB connection closed.")

# --- 상태 확인 라우트 ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "db_connected": db_manager is not None}), 200


if __name__ == '__main__':
    # 프론트엔드 연동을 위해 5001 포트에서 실행
    app.run(host='0.0.0.0', port=5001, debug=True)
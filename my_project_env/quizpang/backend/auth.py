import logging
import hashlib
from flask import Blueprint, request, jsonify
from db import get_db_manager
from flask_cors import CORS 

# 블루프린트 생성
auth_bp = Blueprint('auth', __name__)

# NOTE: 프론트엔드 포트가 5173 또는 5174로 설정된 경우, 백엔드에서 일치시켜야 합니다.
# 이전 대화에서 프론트엔드가 5173일 가능성이 있으므로, CORS 설정을 다시 확인하는 것이 좋습니다.
CORS(auth_bp, resources={r"/api/*": {"origins": "http://localhost:5174"}}) # 5174 대신 5173으로 수정하는 것도 고려해보세요.

logger = logging.getLogger(__name__)

# --- 도우미 함수 ---
def hash_password(password: str) -> str:
    """비밀번호를 SHA256으로 해시합니다."""
    return hashlib.sha256(password.encode()).hexdigest()

# --- 인증 라우트 ---

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """사용자 회원가입 API (POST /api/auth/signup)"""
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500
    
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({"error": "Missing required fields (username, email, password)"}), 400
        
        # 비밀번호 해싱
        password_hash = hash_password(password)
        
        # 사용자 생성 및 ID 반환
        user_id = db_manager.create_user(username, email, password_hash)
        
        # 성공 응답
        return jsonify({
            "message": "User created successfully",
            "user_id": user_id,
            "username": username
        }), 201
        
    except ValueError as e:
        # 데이터베이스 제약 조건 오류 (예: 이메일 중복)
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # 수정된 부분: 예외 정보 로깅 및 디버깅 메시지 포함
        logger.error(f"사용자 회원가입 실패: {e}", exc_info=True) 
        return jsonify({"error": f"Failed to sign up user: {e.__class__.__name__}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """사용자 로그인 API (POST /api/auth/login)"""
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500

    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({"error": "Missing required fields (email, password)"}), 400

        # 데이터베이스에서 사용자 정보 조회
        user = db_manager.get_user_by_email(email)

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # 입력된 비밀번호 해시
        input_password_hash = hash_password(password)

        # 데이터베이스에 저장된 해시와 비교
        if input_password_hash == user['password_hash']:
            # 로그인 성공 응답
            return jsonify({
                "message": "Login successful",
                "user_id": user['id'],
                "username": user['username']
                # 실제 앱에서는 JWT 등을 사용하여 인증 토큰을 발급해야 합니다.
            }), 200
        else:
            # 비밀번호 불일치
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        # 수정된 부분: 예외 정보 로깅 및 디버깅 메시지 포함
        logger.error(f"사용자 로그인 실패: {e}", exc_info=True) 
        return jsonify({"error": f"Failed to log in user: {e.__class__.__name__}: {str(e)}"}), 500
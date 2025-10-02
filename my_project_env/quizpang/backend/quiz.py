# quiz.py

import logging
import json
import os
from flask import Blueprint, jsonify, request, abort
# from google import genai ... (Gemini 관련 코드는 퀴즈 생성 로직에 필요하지만, 
# 프론트엔드 연동을 위한 CRUD API에 집중하기 위해 생략했습니다.)
from db import get_db_manager 

# 블루프린트 생성
quiz_bp = Blueprint('quiz', __name__, url_prefix='/api')

logger = logging.getLogger(__name__)

# --- CRUD 및 연동 API ---

# ------------------------------------
# 1. 퀴즈 생성 API (POST /api/quiz/create) - QuizCreationPage.tsx 연동
# ------------------------------------
@quiz_bp.route('/quiz/create', methods=['POST'])
def create_quiz():
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500

    data = request.get_json()
    if not all(key in data for key in ['title', 'category', 'creator_id', 'questions']):
        return jsonify({"error": "Missing required fields for quiz creation."}), 400

    # Frontend의 Mock ID를 실제 DB ID로 처리 (db.py의 add_mock_users와 연동)
    if data['creator_id'] == 'CurrentUser (Mock)':
        data['creator_id'] = 'mock_user_1' 
        
    try:
        quiz_id = db_manager.add_quiz_and_questions(data)
        return jsonify({
            "message": "Quiz created successfully.",
            "quiz_id": quiz_id,
            "creator_id": data['creator_id']
        }), 201

    except Exception as e:
        logger.error(f"Quiz creation failed: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ------------------------------------
# 2. 퀴즈 목록 조회 API (GET /api/quiz/list)
# ------------------------------------
@quiz_bp.route('/quiz/list', methods=['GET'])
def get_quiz_list():
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500
        
    try:
        quizzes = db_manager.get_all_quizzes()
        # 필드 이름이 프론트엔드와 일치하는지 확인 (quiz_id, votes_avg 등)
        quiz_list = [{
            "quiz_id": q['quiz_id'],
            "title": q['title'],
            "category": q['category'],
            "creator_id": q['creator_id'],
            "votes_avg": q['votes_avg'],
            "votes_count": q['votes_count'],
            "questions_count": q['questions_count'],
        } for q in quizzes]
        
        return jsonify(quiz_list), 200
    except Exception as e:
        logger.error(f"Quiz list fetch failed: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ------------------------------------
# 3. 특정 퀴즈의 문제 목록 조회 API (GET /api/quiz/<int:quiz_id>/questions) - QuizGamePage.tsx 연동
# ------------------------------------
@quiz_bp.route('/quiz/<int:quiz_id>/questions', methods=['GET'])
def get_quiz_with_questions(quiz_id):
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500

    try:
        quiz = db_manager.get_quiz_by_id(quiz_id)
        if not quiz:
            return jsonify({"error": "Quiz not found."}), 404

        questions = db_manager.get_questions_by_quiz_id(quiz_id)
        
        question_list = []
        for q in questions:
            # options는 DB에서 JSON으로 저장되므로, 프론트엔드 형식에 맞춰 역직렬화
            options_data = q.get('options')
            if isinstance(options_data, str):
                 try:
                    options_data = json.loads(options_data)
                 except:
                    options_data = [] # JSON 파싱 실패 시 빈 리스트
            elif options_data is None:
                options_data = []

            question_list.append({
                "id": q['id'],
                "type": q['type'],
                "text": q['text'],
                "options": options_data,
                "correct_answer": q['correct_answer'],
                "explanation": q.get('explanation', ''),
                "votes_avg": q['votes_avg'],
                "votes_count": q['votes_count'],
            })
            
        return jsonify({
            "quiz": {
                "quiz_id": quiz['quiz_id'],
                "title": quiz['title'],
                "category": quiz['category'],
                "creator_id": quiz['creator_id'],
            },
            "questions": question_list
        }), 200
    except Exception as e:
        logger.error(f"Quiz and questions fetch failed for ID {quiz_id}: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ------------------------------------
# 4. 문제 평점 API (POST /api/question/rate) - QuizGamePage.tsx 연동
# ------------------------------------
@quiz_bp.route('/question/rate', methods=['POST'])
def rate_question():
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500
        
    data = request.get_json()
    question_id = data.get('questionId') # Frontend uses questionId
    rating = data.get('rating')
    
    if not all([question_id, rating]) or not (1 <= rating <= 5):
        return jsonify({"error": "Invalid question ID or rating (must be 1-5)."}), 400
        
    try:
        new_avg = db_manager.update_question_rating(question_id, rating)
        return jsonify({"message": "Rating updated successfully.", "new_avg": new_avg}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        logger.error(f"Question rating failed: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ------------------------------------
# 5. 퀴즈 풀이 기록 저장 API (POST /api/attempt/save) - QuizGamePage.tsx 연동
# ------------------------------------
@quiz_bp.route('/attempt/save', methods=['POST'])
def save_quiz_attempt():
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500
        
    data = request.get_json()
    if not all(key in data for key in ['userId', 'quizId', 'score', 'totalQuestions', 'mode']):
         return jsonify({"error": "Missing required fields for quiz attempt."}), 400

    # 필드 이름 통일: Frontend: quizId, Backend: quiz_id
    data['quiz_id'] = data.pop('quizId') 

    try:
        if db_manager.add_quiz_attempt(data):
            return jsonify({"message": "Quiz attempt saved successfully."}), 201
        else:
            raise Exception("No rows affected during save.")

    except Exception as e:
        logger.error(f"Quiz attempt save failed: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ------------------------------------
# 6. 사용자 풀이 기록 조회 API (GET /api/history/<string:user_id>) - HistoryPage.tsx 연동
# ------------------------------------
@quiz_bp.route('/history/<string:user_id>', methods=['GET'])
def get_user_history(user_id):
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500
        
    try:
        attempts = db_manager.get_user_attempts(user_id)
        
        # 필드 이름을 Frontend 규격에 맞춰 변환 (attempt_id -> attemptId, total_questions -> totalQuestions 등)
        history_list = [{
            "attemptId": a['attempt_id'],
            "userId": a['user_id'],
            "quizId": a['quiz_id'],
            "score": a['score'],
            "totalQuestions": a['total_questions'],
            "mode": a['mode'],
            "date": a['date'],
        } for a in attempts]
        
        return jsonify(history_list), 200
    except Exception as e:
        logger.error(f"User history fetch failed for ID {user_id}: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ------------------------------------
# 7. 랭킹 조회 API (GET /api/ranking) - RankingPage.tsx 연동 (핵심 변경 사항)
# ------------------------------------
@quiz_bp.route('/quiz/ranking', methods=['GET'])
def get_ranking():
    db_manager = get_db_manager()
    if not db_manager:
        return jsonify({"error": "Database connection is not available."}), 500
        
    try:
        # DB에서 총 점수, 퀴즈 수로 정렬된 사용자 목록을 가져옴
        ranked_data = db_manager.get_ranking_data()
        
        # DB에서 가져온 데이터를 기반으로 순위를 계산하고 Frontend 규격에 맞춰 포맷팅
        ranking_list = []
        # ranked_data가 비어 있으면 이 반복문은 실행되지 않음
        for index, row in enumerate(ranked_data):
            ranking_list.append({
                "rank": index + 1, # 1부터 시작하는 순위 부여
                "userId": row['userId'],
                "username": row['username'],
                "totalScore": round(row['totalScore'] or 0), # 점수를 정수로 반올림
                "quizCount": row['quizCount']
            })
            
        return jsonify(ranking_list), 200 #<-- 빈 리스트일 경우 [] JSON 반환
    except Exception as e:
        logger.error(f"Ranking data fetch failed: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# db.py (MariaDB / PyMySQL 기반)

import os
import logging
import json
from dotenv import load_dotenv
import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime
import random
import time

# .env 파일에서 환경 변수 로드
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DBManager:
    """
    MariaDB 연결 풀을 관리하고 쿼리를 실행하는 클래스.
    """
    # ------------------
    # 1. 초기화 및 연결
    # ------------------
    def __init__(self):
        self.DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
        self.DB_USER = os.getenv("DB_USER", "root")
        self.DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")
        self.DB_NAME = os.getenv("DB_NAME", "quizpang")
        self.DB_PORT = int(os.getenv("DB_PORT", 3306))

        self.conn = None
        # 데이터베이스 연결 및 테이블 초기화
        self._initialize_database()

    def _get_connection(self):
        """데이터베이스 연결을 반환합니다."""
        if self.conn and self.conn.open:
            return self.conn
        
        try:
            self.conn = pymysql.connect(
                host=self.DB_HOST,
                user=self.DB_USER,
                password=self.DB_PASSWORD,
                database=self.DB_NAME,
                port=self.DB_PORT,
                cursorclass=DictCursor # 딕셔너리 형태로 결과를 반환하도록 설정
            )
            return self.conn
        except pymysql.Error as e:
            logger.error(f"MariaDB 연결 실패: {e}")
            raise

    # ------------------
    # 2. 테이블 생성 SQL 및 초기화
    # ------------------
    def _initialize_database(self):
        """필요한 테이블들을 생성합니다."""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # 1. User 테이블 (auth.py에서 사용)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS User (
                        id VARCHAR(80) PRIMARY KEY,
                        username VARCHAR(80) NOT NULL UNIQUE,
                        email VARCHAR(120) NOT NULL UNIQUE,
                        password_hash VARCHAR(256) NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """)

                # 2. Quiz 테이블 (votes_avg, votes_count 추가됨)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Quiz (
                        quiz_id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(100) NOT NULL,
                        category VARCHAR(50) NOT NULL,
                        creator_id VARCHAR(80) NOT NULL,
                        votes_avg FLOAT DEFAULT 0.0,
                        votes_count INT DEFAULT 0,
                        questions_count INT DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (creator_id) REFERENCES User(id)
                    );
                """)
                
                # 3. Question 테이블 (type, options, votes_avg, votes_count 추가됨)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Question (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        quiz_id INT NOT NULL,
                        type VARCHAR(20) NOT NULL, -- 'multiple', 'ox', 'subjective'
                        text TEXT NOT NULL,
                        options JSON, -- MariaDB 5.7+ JSON Type 사용
                        correct_answer VARCHAR(500) NOT NULL,
                        explanation TEXT,
                        votes_avg FLOAT DEFAULT 0.0,
                        votes_count INT DEFAULT 0,
                        FOREIGN KEY (quiz_id) REFERENCES Quiz(quiz_id) ON DELETE CASCADE
                    );
                """)

                # 4. QuizAttempt 테이블 (HistoryPage.tsx 요구사항 반영)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS QuizAttempt (
                        attempt_id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id VARCHAR(80) NOT NULL,
                        quiz_id INT NOT NULL,
                        score INT NOT NULL,
                        total_questions INT NOT NULL,
                        mode VARCHAR(20) NOT NULL, -- 'exam' or 'study'
                        date BIGINT NOT NULL, -- UNIX TimeStamp (ms)
                        FOREIGN KEY (user_id) REFERENCES User(id),
                        FOREIGN KEY (quiz_id) REFERENCES Quiz(quiz_id) ON DELETE CASCADE
                    );
                """)

                # 5. UserQuizVote 테이블 (사용자가 퀴즈에 투표했는지 추적)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS UserQuizVote (
                        user_id VARCHAR(80) NOT NULL,
                        quiz_id INT NOT NULL,
                        rating INT NOT NULL,
                        PRIMARY KEY (user_id, quiz_id),
                        FOREIGN KEY (user_id) REFERENCES User(id),
                        FOREIGN KEY (quiz_id) REFERENCES Quiz(quiz_id) ON DELETE CASCADE
                    );
                """)
                
                conn.commit()
                logger.info("MariaDB 연결 성공 및 테이블 초기화 완료.")

        except pymysql.Error as e:
            logger.error(f"테이블 생성 오류: {e}")
            conn.rollback()
            raise
        
        # Mock User 데이터 생성 (frontend `creator_id: 'CurrentUser (Mock)'` 대응)
        self.add_mock_users()

    # ------------------
    # 3. 공통 DB 메서드 (기존 유지 + 일부 수정)
    # ------------------

    # ... (기존 get_user_by_email, add_user, hash_password, execute_transaction, 
    # execute_query, execute_non_query, close 메서드 유지) ...
    
    # 편의상 기존에 제공된 로직을 재사용 및 확장합니다. 
    # 기존 `db.py`에 있는 `execute_query`, `execute_non_query`, `execute_transaction` 등은 그대로 있다고 가정하고,
    # 퀴즈 관련 신규 메서드만 추가/수정합니다.

    def add_mock_users(self):
        """Mock 사용자가 없으면 추가합니다."""
        # 실제 사용자 ID가 필요하므로 임시 ID를 사용합니다.
        mock_user_id = 'mock_user_1' 
        try:
            user = self.get_user_by_id(mock_user_id)
            if not user:
                sql = "INSERT INTO User (id, username, email, password_hash) VALUES (%s, %s, %s, %s)"
                # 비밀번호 해시는 auth.py의 hash_password를 사용해야 하지만, 여기서는 더미 값으로 처리
                dummy_hash = 'dummypasswordhash' 
                self.execute_non_query(sql, (mock_user_id, 'MockCreator', 'mock@quizpang.com', dummy_hash))
                logger.info(f"Mock user {mock_user_id} 생성 완료.")
        except Exception as e:
            logger.warning(f"Mock user 생성 중 오류 발생: {e}")
            
    def get_user_by_id(self, user_id: int):
        """사용자 ID로 사용자 정보를 조회합니다."""
        sql = "SELECT id, username, email FROM users WHERE id = %s"
        user = self.execute_query(sql, (user_id,), fetchone=True)
        return user
        
    def get_user_by_email(self, email: str):
        """이메일 주소로 사용자 정보를 조회합니다."""
        sql = "SELECT id, username, email, password_hash FROM users WHERE email = %s"
        # execute_query는 DBManager 클래스에 이미 정의되어 있습니다.
        # 이 메서드를 호출하여 쿼리를 실행합니다.
        user = self.execute_query(sql, (email,), fetchone=True)
        return user
    
    def create_user(self, username: str, email: str, password_hash: str) -> int:
        """새로운 사용자를 생성하고 ID를 반환합니다."""
        try:
            # 이메일 중복 확인
            if self.get_user_by_email(email):
                raise ValueError(f"Email '{email}' already exists.")
                
            sql = "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)"
            self.execute_non_query(sql, (username, email, password_hash))
            
            # 마지막으로 삽입된 ID 반환
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT LAST_INSERT_ID()")
                return cursor.fetchone()['LAST_INSERT_ID()']
                
        except pymysql.err.IntegrityError as e:
            # UNIQUE 제약 조건 오류 등 처리
            if 'for key \'email\'' in str(e):
                raise ValueError(f"Email '{email}' already exists.")
            raise


        
    # ------------------
    # 4. 퀴즈 관련 신규 메서드
    # ------------------
    
    def add_quiz_and_questions(self, quiz_data):
        """퀴즈와 문제들을 하나의 트랜잭션으로 저장합니다."""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # 1. Quiz 삽입
                quiz_sql = """
                    INSERT INTO Quiz (title, category, creator_id, questions_count)
                    VALUES (%s, %s, %s, %s);
                """
                cursor.execute(quiz_sql, (
                    quiz_data['title'], 
                    quiz_data['category'], 
                    quiz_data['creator_id'], 
                    len(quiz_data['questions'])
                ))
                quiz_id = cursor.lastrowid # 삽입된 퀴즈의 ID

                # 2. Question들 삽입
                question_sql = """
                    INSERT INTO Question (quiz_id, type, text, options, correct_answer, explanation)
                    VALUES (%s, %s, %s, %s, %s, %s);
                """
                for q in quiz_data['questions']:
                    # options는 프론트엔드에서 JSON 문자열을 보낼 것이므로, JSON.dumps 대신 그대로 사용하거나 (JSON 타입인 경우) JSON.dumps를 한번 더 방어적으로 처리
                    # 여기서는 MariaDB의 JSON 타입에 맞춰 JSON.dumps를 적용
                    options_json = json.dumps(q.get('options')) if q.get('options') else None
                    
                    cursor.execute(question_sql, (
                        quiz_id,
                        q['type'],
                        q['text'],
                        options_json,
                        q['correct_answer'],
                        q.get('explanation', '')
                    ))
                
                conn.commit()
                return quiz_id
        except pymysql.Error as e:
            logger.error(f"퀴즈 및 문제 저장 트랜잭션 실패: {e}")
            conn.rollback()
            raise
            
    def get_all_quizzes(self):
        """모든 퀴즈 목록을 조회합니다. (HomePage.tsx, HistoryPage.tsx, RankingPage.tsx 연동)"""
        sql = "SELECT quiz_id, title, category, creator_id, votes_avg, votes_count, questions_count FROM Quiz ORDER BY created_at DESC"
        return self.execute_query(sql)

    def get_quiz_by_id(self, quiz_id):
        """단일 퀴즈 정보를 조회합니다."""
        sql = "SELECT quiz_id, title, category, creator_id, votes_avg, votes_count, questions_count FROM Quiz WHERE quiz_id = %s"
        return self.execute_query(sql, (quiz_id,), fetchone=True)
        
    def get_questions_by_quiz_id(self, quiz_id):
        """특정 퀴즈의 문제들을 조회합니다. (QuizGamePage.tsx 연동)"""
        sql = """
            SELECT id, quiz_id, type, text, options, correct_answer, explanation, votes_avg, votes_count 
            FROM Question 
            WHERE quiz_id = %s
        """
        questions = self.execute_query(sql, (quiz_id,))
        # options가 JSON 타입인 경우, pymysql이 딕셔너리로 변환하므로 그대로 사용
        # TEXT 타입에 JSON 문자열이 저장되었다면 json.loads 처리가 필요할 수 있음
        return questions

    def update_question_rating(self, question_id, rating):
        """문제 평점을 업데이트하고 새 평균을 반환합니다. (QuizGamePage.tsx 평점 기능)"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # 1. 현재 평점 정보 조회
                select_sql = "SELECT votes_avg, votes_count FROM Question WHERE id = %s"
                cursor.execute(select_sql, (question_id,))
                q = cursor.fetchone()
                
                if not q:
                    raise ValueError("Question not found")
                    
                # 2. 새로운 가중 평균 계산
                current_total_score = q['votes_avg'] * q['votes_count']
                new_votes_count = q['votes_count'] + 1
                new_total_score = current_total_score + rating
                new_votes_avg = new_total_score / new_votes_count
                
                # 3. 평점 업데이트
                update_sql = """
                    UPDATE Question 
                    SET votes_avg = %s, votes_count = %s 
                    WHERE id = %s
                """
                cursor.execute(update_sql, (new_votes_avg, new_votes_count, question_id))
                
                conn.commit()
                return new_votes_avg
        except pymysql.Error as e:
            logger.error(f"문제 평점 업데이트 실패: {e}")
            conn.rollback()
            raise

    def add_quiz_attempt(self, attempt_data):
        """사용자의 퀴즈 풀이 기록을 저장합니다. (QuizGamePage.tsx 완료 시)"""
        sql = """
            INSERT INTO QuizAttempt (user_id, quiz_id, score, total_questions, mode, date)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        # date는 프론트엔드에서 UNIX timestamp (ms)를 사용하므로 서버에서 생성
        attempt_data['date'] = int(time.time() * 1000) 
        
        row_count = self.execute_non_query(sql, (
            attempt_data['userId'],
            attempt_data['quizId'],
            attempt_data['score'],
            attempt_data['totalQuestions'],
            attempt_data['mode'],
            attempt_data['date']
        ))
        return row_count > 0

    def get_user_attempts(self, user_id):
        """특정 사용자의 모든 풀이 기록을 최신순으로 조회합니다. (HistoryPage.tsx)"""
        sql = """
            SELECT attempt_id, user_id, quiz_id, score, total_questions, mode, date 
            FROM QuizAttempt 
            WHERE user_id = %s 
            ORDER BY date DESC
        """
        return self.execute_query(sql, (user_id,))
        
    def get_ranking_data(self):
        """랭킹 페이지에 필요한 데이터를 조회합니다. (RankingPage.tsx 로직 연동)"""
        # 퀴즈 제작자별 (Quiz.creator_id) 퀴즈 평점(votes_avg * votes_count)의 총합을 계산
        sql = """
            SELECT 
                T1.creator_id AS userId,
                T2.username AS username,
                SUM(T1.votes_avg * T1.votes_count) AS totalScore,
                COUNT(T1.quiz_id) AS quizCount
            FROM Quiz T1
            JOIN User T2 ON T1.creator_id = T2.id
            GROUP BY T1.creator_id, T2.username
            ORDER BY totalScore DESC;
        """
        # MariaDB는 랭킹을 직접 계산하지 않으므로, 애플리케이션 레벨에서 처리할 수 있도록 점수 데이터만 제공
        return self.execute_query(sql)


# 싱글톤 패턴을 위한 전역 변수
db_manager = None

def get_db_manager():
    # ... (기존 get_db_manager 함수 유지) ...
    """DBManager의 싱글톤 인스턴스를 반환합니다."""
    global db_manager
    if db_manager is None:
        try:
            db_manager = DBManager()
        except Exception as e:
            logger.error(f"DBManager 초기화 실패: {e}")
            # 초기화 실패 시 db_manager를 None으로 유지
            db_manager = None 
    return db_manager
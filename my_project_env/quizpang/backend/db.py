# db.py (MariaDB / PyMySQL 기반)

import os
import logging
import json
from dotenv import load_dotenv
import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple

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

        # self.conn = None
        # 데이터베이스 연결 및 테이블 초기화
        self._initialize_database()

    # def _get_connection(self):
    #     """데이터베이스 연결을 반환합니다."""
    #     if self.conn and self.conn.open:
    #         return self.conn
        
    #     try:
    #         self.conn = pymysql.connect(
    #             host=self.DB_HOST,
    #             user=self.DB_USER,
    #             password=self.DB_PASSWORD,
    #             database=self.DB_NAME,
    #             port=self.DB_PORT,
    #             cursorclass=DictCursor # 딕셔너리 형태로 결과를 반환하도록 설정
    #         )
    #         return self.conn
    #     except pymysql.Error as e:
    #         logger.error(f"MariaDB 연결 실패: {e}")
    #         raise
    def _get_connection(self):
        """요청/쿼리마다 새 커넥션 생성."""
        conn = pymysql.connect(
            host=self.DB_HOST,
            user=self.DB_USER,
            password=self.DB_PASSWORD,
            database=self.DB_NAME,
            port=self.DB_PORT,
            cursorclass=DictCursor,
            autocommit=True,              # ✅ 자동 커밋
            charset="utf8mb4"
        )
        # 유휴 연결 재연결 안전장치
        try:
            conn.ping(reconnect=True)
        except Exception:
            pass
        return conn
    
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
        finally:
            conn.close()
        
        # Mock User 데이터 생성 (frontend `creator_id: 'CurrentUser (Mock)'` 대응)
        # self.add_mock_users()

    # ------------------
    # 3. 공통 DB 메서드 (기존 유지 + 일부 수정)
    # ------------------

    # ... (기존 get_user_by_email, add_user, hash_password, execute_transaction, 
    # execute_query, execute_non_query, close 메서드 유지) ...
    
    # 편의상 기존에 제공된 로직을 재사용 및 확장합니다. 
    # 기존 `db.py`에 있는 `execute_query`, `execute_non_query`, `execute_transaction` 등은 그대로 있다고 가정하고,
    # 퀴즈 관련 신규 메서드만 추가/수정합니다.
            
    def get_user_by_id(self, user_id: str):
        """사용자 ID로 사용자 정보를 조회합니다."""
        sql = "SELECT id, username, email FROM user WHERE id = %s"
        user = self.execute_query(sql, (user_id,), fetchone=True)
        return user
        
    def get_user_by_email(self, email: str):
        """이메일 주소로 사용자 정보를 조회합니다."""
        sql = "SELECT id, username, email, password_hash FROM user WHERE email = %s"
        # execute_query는 DBManager 클래스에 이미 정의되어 있습니다.
        # 이 메서드를 호출하여 쿼리를 실행합니다.
        user = self.execute_query(sql, (email,), fetchone=True)
        return user
    
    def create_user(self,new_user_id, username: str, email: str, password_hash: str) -> int:
        """새로운 사용자를 생성하고 ID를 반환합니다."""
        try:

            # 이메일 중복 확인
            if self.get_user_by_email(email):
                raise ValueError(f"Email '{email}' already exists.")
                
            sql = "INSERT INTO user (id ,username, email, password_hash) VALUES (%s,%s, %s, %s)"
            self.execute_non_query(sql, (new_user_id,username, email, password_hash))
            
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
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                quiz_sql = """
                    INSERT INTO `quiz` (title, category, creator_id, questions_count)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(
                    quiz_sql,
                    (quiz_data['title'], quiz_data['category'], quiz_data['creator_id'], len(quiz_data['questions']))
                )
                quiz_id = cursor.lastrowid

                # ✅ options 처리: 프론트가 문자열로 주면 그대로, 파이썬 list/dict면 dumps
                question_sql = """
                    INSERT INTO `question`
                    (quiz_id, type, text, options, correct_answer, explanation)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                for q in quiz_data['questions']:
                    opts = q.get('options', None)
                    if opts is None:
                        options_json = None
                    elif isinstance(opts, str):
                        options_json = opts.strip()  # 이미 JSON 문자열
                    else:
                        options_json = json.dumps(opts, ensure_ascii=False)

                    cursor.execute(
                        question_sql,
                        (
                            quiz_id,
                            q['type'],
                            q['text'],
                            options_json,
                            q['correct_answer'],
                            q.get('explanation', '')
                        )
                    )

                conn.commit()
                return quiz_id
        except pymysql.Error as e:
            logger.error(f"퀴즈 및 문제 저장 트랜잭션 실패: {e}")
            conn.rollback()
            raise
 
    def get_created_quizzes_by_user(self, user_id: str):
        sql = """
            SELECT
                q.quiz_id,
                q.title,
                -- 문제 수는 Question 개수로 계산
                COUNT(qq.id) AS questions_count,
                -- 총 투표 수
                IFNULL(SUM(qq.votes_count), 0) AS votes_count,
                -- 가중 평균(투표 수 기준)
                IFNULL(
                    CASE WHEN SUM(qq.votes_count) > 0
                        THEN SUM(qq.votes_avg * qq.votes_count) / SUM(qq.votes_count)
                        ELSE 0
                    END, 0
                ) AS votes_avg,
                q.created_at
            FROM Quiz q
            LEFT JOIN Question qq ON qq.quiz_id = q.quiz_id
            WHERE q.creator_id = %s
            GROUP BY q.quiz_id, q.title, q.created_at
            ORDER BY q.created_at DESC
        """
        return self.execute_query(sql, (user_id,))


            

    def get_all_quizzes(self):
        sql = """
        SELECT
            q.quiz_id,
            q.title,
            q.category,
            q.creator_id,
            COUNT(qq.id) AS questions_count,
            IFNULL(SUM(qq.votes_count), 0) AS votes_count,
            IFNULL(
                CASE WHEN SUM(qq.votes_count) > 0
                    THEN SUM(qq.votes_avg * qq.votes_count) / SUM(qq.votes_count)
                    ELSE 0
                END, 0
            ) AS votes_avg
        FROM Quiz q
        LEFT JOIN Question qq ON qq.quiz_id = q.quiz_id
        GROUP BY q.quiz_id, q.title, q.category, q.creator_id
        ORDER BY q.quiz_id DESC;
        """
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


    
    
    def update_question_rating(self, question_id: int, rating: int):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT votes_avg, votes_count FROM Question WHERE id=%s",
                    (question_id,)
                )
                row = cursor.fetchone()
                if not row:
                    raise ValueError("Question not found")

                new_count = (row["votes_count"] or 0) + 1
                new_avg = ((row["votes_avg"] or 0) * (row["votes_count"] or 0) + rating) / new_count

                cursor.execute(
                    "UPDATE Question SET votes_avg=%s, votes_count=%s WHERE id=%s",
                    (new_avg, new_count, question_id)
                )
            conn.commit()
            return new_avg
        finally:
            conn.close()



    
    def add_quiz_attempt(self, attempt_data):
        """사용자의 퀴즈 풀이 기록을 저장합니다. (QuizGamePage.tsx 완료 시)"""
        sql = """
            INSERT INTO QuizAttempt (user_id, quiz_id, score, total_questions, mode, date)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        # 서버에서 timestamp(ms) 생성
        attempt_data['date'] = int(time.time() * 1000)

        # ✅ 여기서 'quiz_id'를 사용 (엔드포인트에서 quizId -> quiz_id 로 변환됨)
        return self.execute_non_query(sql, (
            attempt_data['userId'],
            attempt_data['quiz_id'],     # <-- 핵심 수정
            attempt_data['score'],
            attempt_data['totalQuestions'],
            attempt_data['mode'],
            attempt_data['date']
        )) > 0


    def get_user_attempts(self, user_id):
        """특정 사용자의 모든 풀이 기록을 최신순으로 조회합니다. (HistoryPage.tsx)"""
        sql = """
            SELECT attempt_id, user_id, quiz_id, score, total_questions, mode, date 
            FROM QuizAttempt 
            WHERE user_id = %s 
            ORDER BY date DESC
        """
        return self.execute_query(sql, (user_id,))
        
    # def get_ranking_data(self):
    #     """랭킹 페이지에 필요한 데이터를 조회합니다. (RankingPage.tsx 로직 연동)"""
    #     # 퀴즈 제작자별 (Quiz.creator_id) 퀴즈 평점(votes_avg * votes_count)의 총합을 계산
    #     sql = """
    #         SELECT 
    #             T1.creator_id AS userId,
    #             T2.username AS username,
    #             SUM(T1.votes_avg * T1.votes_count) AS totalScore,
    #             COUNT(T1.quiz_id) AS quizCount
    #         FROM Quiz T1
    #         JOIN User T2 ON T1.creator_id = T2.id
    #         GROUP BY T1.creator_id, T2.username
    #         ORDER BY totalScore DESC;
    #     """
    #     # MariaDB는 랭킹을 직접 계산하지 않으므로, 애플리케이션 레벨에서 처리할 수 있도록 점수 데이터만 제공
    #     return self.execute_query(sql)
    
    # ------------------------------------
    # 3. 랭킹 데이터 조회 (RankingPage.tsx 연동)
    # ------------------------------------
    def get_ranking_data(self) -> List[Dict[str, Any]]:
        """
        사용자별 총 점수(QuizAttempt 합산)와 생성한 퀴즈 수(quizzes 카운트)를 조회하고
        총 점수를 기준으로 내림차순 정렬하여 반환합니다.
        """
        # 사용자 점수(QuizAttempt)와 생성한 퀴즈 수(quizzes)를 결합하여 조회
        sql = """
        SELECT
         	u.id AS userId,
            u.username AS username,
            COALESCE(SUM(qa.score), 0) AS totalScore, -- 총 획득 점수
            COALESCE(tqc.quizCount, 0) AS quizCount    -- 생성한 퀴즈 수
        FROM
            User u
        LEFT JOIN
            QuizAttempt qa ON u.id = qa.user_id
        LEFT JOIN (
                    -- 각 사용자가 생성한 퀴즈 수를 미리 계산하는 서브쿼리
                    SELECT 
                            q.creator_id,
                            COUNT(q.quiz_id) AS quizCount
                        FROM Quiz q 
                        GROUP BY creator_id
                ) tqc ON u.id = tqc.creator_id
        GROUP BY
            u.id, u.username
        ORDER BY
                    totalScore DESC, quizCount DESC, username ASC -- 총점 > 퀴즈 수 > 이름 순으로 정렬
        LIMIT 100; -- 상위 100명만 조회
        """
        # execute_query는 fetchall을 반환 (DictCursor 사용)
        return self.execute_query(sql)

    
    # ------------------
    # 3. 공통 DB 메서드 (핵심 구현)
    # ------------------

    def execute_query(self, sql: str, params=None, fetchone=False):
        """SELECT 쿼리를 실행하고 결과를 반환합니다."""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                if fetchone:
                    return cursor.fetchone()
                return cursor.fetchall()
        except pymysql.Error as e:
            logger.error(f"쿼리 실행 실패: {sql}, 오류: {e}")
            raise

    def execute_non_query(self, sql: str, params=None) -> int:
        """INSERT, UPDATE, DELETE 쿼리를 실행하고 영향을 받은 행 수를 반환합니다."""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                row_count = cursor.execute(sql, params)
            conn.commit()
            return row_count
        except pymysql.Error as e:
            logger.error(f"Non-Query 실행 실패: {sql}, 오류: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()


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
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

# =========================================================
# 💡 1. 초기 퀴즈 데이터 정의 (Mock Data)
# =========================================================
# 퀴즈 목록 (Quiz 테이블)과 문제 목록 (Question 테이블)에 들어갈 데이터입니다.
# votes_avg, votes_count, questions_count 등은 DB 삽입 시 자동으로 계산되거나 0으로 초기화됩니다.
# 여기서 questions_count는 Quiz 테이블에 미리 넣어주면 됩니다.
initial_quizzes_data = [
    {
        'title': 'React 기초',
        'category': '프로그래밍',
        'creator_id': 'Admin',
        'questions': [
            {'type': 'multiple', 'text': 'React에서 컴포넌트의 상태를 관리하는 Hook은 무엇인가요?', 'options': ['useState', 'useEffect', 'useContext', 'useReducer'], 'correct_answer': 'useState', 'explanation': 'useState는 함수형 컴포넌트에서 상태(state)를 추가하고 관리할 수 있게 해주는 Hook입니다. 상태가 변경되면 컴포넌트가 다시 렌더링됩니다.', 'votes_avg': 4.2, 'votes_count': 50},
            {'type': 'ox', 'text': 'React는 Angular보다 먼저 출시되었다.', 'options': ['O', 'X'], 'correct_answer': 'X', 'explanation': 'AngularJS(1.0)는 2010년에, React는 2013년에 출시되었습니다. 따라서 React가 더 늦게 출시되었습니다.', 'votes_avg': 4.0, 'votes_count': 45},
            {'type': 'subjective', 'text': '가상 DOM은 무엇의 약자인가요?', 'correct_answer': 'Virtual DOM', 'explanation': '가상 DOM(Virtual DOM)은 실제 DOM의 가벼운 복사본으로, UI 변경 사항을 메모리에서 계산하여 실제 DOM 조작을 최소화함으로써 성능을 향상시킵니다.', 'votes_avg': 4.6, 'votes_count': 60},
        ]
    },
    {
        'title': '한국사 퀴즈',
        'category': '역사',
        'creator_id': 'HistoryBuff',
        'questions': [
            {'type': 'multiple', 'text': '조선을 건국한 왕의 이름은 무엇인가요?', 'options': ['태조 이성계', '세종대왕', '궁예', '왕건'], 'correct_answer': '태조 이성계', 'explanation': '태조 이성계는 위화도 회군을 통해 고려를 무너뜨리고 1392년에 조선을 건국한 초대 왕입니다.', 'votes_avg': 4.9, 'votes_count': 120},
            {'type': 'subjective', 'text': '임진왜란 당시 이순신 장군이 한산도에서 사용한 진법 이름은?', 'correct_answer': '학익진', 'explanation': '학익진은 학이 날개를 펼친 형태의 진법으로, 한산도 대첩에서 이순신 장군이 사용하여 일본 수군을 크게 물리치는 데 결정적인 역할을 했습니다.', 'votes_avg': 4.8, 'votes_count': 110},
        ]
    },
    {
        'title': 'JavaScript 심화',
        'category': '프로그래밍',
        'creator_id': 'CodeMaster',
        'questions': [
            {'type': 'subjective', 'text': 'JavaScript에서 "===" 연산자는 무엇을 비교하나요?', 'correct_answer': '값과 타입', 'explanation': '"===" 연산자는 값과 타입을 모두 비교하는 엄격한 동등 연산자입니다.', 'votes_avg': 4.9, 'votes_count': 150},
            {'type': 'multiple', 'text': '다음 중 JavaScript의 원시 타입이 아닌 것은?', 'options': ['Object', 'String', 'Number', 'Boolean'], 'correct_answer': 'Object', 'explanation': 'Object는 참조 타입이며, String, Number, Boolean, Null, Undefined, Symbol, BigInt는 원시 타입입니다.', 'votes_avg': 4.8, 'votes_count': 160},
        ]
    },
    {
        'title': '알쓸신잡 퀴즈',
        'category': '상식',
        'creator_id': 'TriviaKing',
        'questions': [
            {'type': 'ox', 'text': '물의 화학식은 H2O2이다.', 'options': ['O', 'X'], 'correct_answer': 'X', 'explanation': '물의 화학식은 H2O이며, H2O2는 과산화수소입니다.', 'votes_avg': 4.1, 'votes_count': 90},
            {'type': 'multiple', 'text': '지구에서 가장 큰 대륙은?', 'options': ['아시아', '아프리카', '북아메리카', '유럽'], 'correct_answer': '아시아', 'explanation': '아시아는 면적과 인구 모두에서 세계에서 가장 큰 대륙입니다.', 'votes_avg': 4.3, 'votes_count': 90},
        ]
    },
    {
        'title': 'CSS 마스터',
        'category': '프로그래밍',
        'creator_id': 'CodeMaster',
        'questions': [
            {'type': 'subjective', 'text': 'CSS에서 글자 색을 바꾸는 속성은 무엇인가요?', 'correct_answer': 'color', 'explanation': 'color 속성을 사용하여 텍스트의 색상을 지정할 수 있습니다.', 'votes_avg': 4.5, 'votes_count': 80},
            {'type': 'multiple', 'text': 'CSS 박스 모델에 포함되지 않는 것은?', 'options': ['display', 'margin', 'padding', 'border'], 'correct_answer': 'display', 'explanation': 'CSS 박스 모델은 content, padding, border, margin으로 구성됩니다. display는 요소의 렌더링 방식을 결정하는 속성입니다.', 'votes_avg': 4.7, 'votes_count': 70},
        ]
    },
    {
        'title': '세계사 상식',
        'category': '역사',
        'creator_id': 'HistoryBuff',
        'questions': [
            {'type': 'multiple', 'text': '제2차 세계대전을 일으킨 독일의 지도자는?', 'options': ['히틀러', '무솔리니', '스탈린', '처칠'], 'correct_answer': '히틀러', 'explanation': '아돌프 히틀러는 나치 독일의 총통으로 제2차 세계대전을 일으켰습니다.', 'votes_avg': 4.6, 'votes_count': 110},
            {'type': 'subjective', 'text': '프랑스 혁명의 3대 정신은 자유, 평등, 그리고 무엇인가요?', 'correct_answer': '박애', 'explanation': '프랑스 혁명은 자유, 평등, 박애(우애)를 기본 이념으로 삼았습니다.', 'votes_avg': 4.8, 'votes_count': 110},
        ]
    },
    {
        'title': '알고리즘 챌린지',
        'category': '프로그래밍',
        'creator_id': 'CodeMaster',
        'questions': [
            {'type': 'multiple', 'text': '시간 복잡도 O(n log n)을 가지는 정렬 알고리즘이 아닌 것은?', 'options': ['버블 정렬', '퀵 정렬', '병합 정렬', '힙 정렬'], 'correct_answer': '버블 정렬', 'explanation': '버블 정렬의 평균 및 최악 시간 복잡도는 O(n^2)입니다. 퀵, 병합, 힙 정렬은 평균적으로 O(n log n)의 시간 복잡도를 가집니다.', 'votes_avg': 4.9, 'votes_count': 250},
            {'type': 'subjective', 'text': '큐(Queue) 자료구조의 특징을 나타내는 약어는 무엇인가요?', 'correct_answer': 'FIFO', 'explanation': '큐는 First-In, First-Out (FIFO) 원칙에 따라 동작하는 자료구조입니다. 먼저 들어온 데이터가 먼저 나갑니다.', 'votes_avg': 4.7, 'votes_count': 200},
        ]
    },
]

# 모의 사용자 데이터 (creator_id 참조 무결성을 위해 필요)
initial_users_data = [
    {'id': 'Admin', 'username': '관리자', 'email': 'admin@quizpang.com', 'password_hash': 'placeholder'},
    {'id': 'HistoryBuff', 'username': '역사덕후', 'email': 'history@quizpang.com', 'password_hash': 'placeholder'},
    {'id': 'CodeMaster', 'username': '코드마스터', 'email': 'code@quizpang.com', 'password_hash': 'placeholder'},
    {'id': 'TriviaKing', 'username': '잡학박사', 'email': 'trivia@quizpang.com', 'password_hash': 'placeholder'},
]

# =========================================================

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

        # 데이터베이스 연결 및 테이블 초기화
        self._initialize_database()

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
        """필요한 테이블들을 생성하고 초기 데이터를 삽입합니다."""
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

            # 테이블 생성 후 초기 데이터 삽입 시도
            self._insert_initial_data()

        except pymysql.Error as e:
            logger.error(f"테이블 생성 오류: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
            
    def _insert_initial_users(self):
        """초기 퀴즈 제작자 사용자 데이터를 삽입합니다. (INSERT IGNORE 사용)"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # 퀴즈 제작자들은 항상 존재해야 하므로, INSERT IGNORE를 사용하여
                # 이미 존재하는 사용자 ID(Admin, HistoryBuff 등)에 대해서는 무시하고,
                # 존재하지 않는 경우에만 새로 삽입하도록 합니다.
                
                # 기존의 SELECT COUNT(*) 로직을 삭제하여, 다른 사용자가 있어도 Mock User 삽입 시도를 보장합니다.
                
                sql = "INSERT IGNORE INTO User (id, username, email, password_hash) VALUES (%s, %s, %s, %s)"
                for user in initial_users_data:
                    # 비밀번호는 더미 데이터이므로 'placeholder'를 사용합니다.
                    cursor.execute(sql, (user['id'], user['username'], user['email'], user['password_hash']))
                
                conn.commit()
                logger.info(f"초기 사용자 데이터 삽입/확인 완료. (총 {cursor.rowcount}개 행이 새로 삽입됨)")
        except pymysql.Error as e:
            logger.error(f"초기 사용자 삽입 실패: {e}")
            conn.rollback()
        finally:
            conn.close()


    def _insert_initial_quizzes(self):
        """초기 퀴즈 및 문제 데이터를 삽입합니다."""
        # 퀴즈 제작자 데이터가 먼저 삽입되어야 외래 키 제약 조건을 위반하지 않습니다.
        self._insert_initial_users() 

        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # 퀴즈 테이블에 레코드가 있는지 확인
                cursor.execute("SELECT COUNT(*) FROM Quiz")
                if cursor.fetchone()['COUNT(*)'] > 0:
                    logger.info("Quiz 테이블에 이미 데이터가 존재하므로 초기 퀴즈 삽입을 건너뜁니다.")
                    return

                # 퀴즈 데이터 삽입 로직
                quiz_sql = """
                    INSERT INTO Quiz (title, category, creator_id, questions_count)
                    VALUES (%s, %s, %s, %s)
                """
                question_sql = """
                    INSERT INTO Question (quiz_id, type, text, options, correct_answer, explanation, votes_avg, votes_count)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

                for quiz_data in initial_quizzes_data:
                    # 퀴즈 삽입
                    cursor.execute(
                        quiz_sql,
                        (quiz_data['title'], quiz_data['category'], quiz_data['creator_id'], len(quiz_data['questions']))
                    )
                    quiz_id = cursor.lastrowid # 방금 삽입된 퀴즈 ID 가져오기

                    # 문제 삽입
                    for q in quiz_data['questions']:
                        # options는 JSON 문자열로 변환하여 저장
                        opts = q.get('options', None)
                        options_json = json.dumps(opts, ensure_ascii=False) if opts else None
                        
                        # votes_avg와 votes_count도 초기 데이터에서 가져오기
                        votes_avg = q.get('votes_avg', 0.0)
                        votes_count = q.get('votes_count', 0)

                        cursor.execute(
                            question_sql,
                            (
                                quiz_id,
                                q['type'],
                                q['text'],
                                options_json,
                                q['correct_answer'],
                                q.get('explanation', ''),
                                votes_avg,
                                votes_count
                            )
                        )
                
                conn.commit()
                logger.info(f"{len(initial_quizzes_data)}개의 초기 퀴즈 데이터 삽입 완료.")
        except pymysql.Error as e:
            logger.error(f"초기 퀴즈 및 문제 삽입 실패: {e}")
            conn.rollback()
        finally:
            conn.close()

    def _insert_initial_data(self):
        """테이블 생성 후 모든 초기 데이터를 삽입하는 메인 함수입니다."""
        try:
            self._insert_initial_quizzes()
        except Exception as e:
            logger.error(f"전체 초기 데이터 삽입 과정 중 오류 발생: {e}")
            # 이 시점에서 오류가 발생해도 테이블 자체는 존재하므로 프로그램은 계속 실행됩니다.


    # ------------------
    # 3. 공통 DB 메서드 (기존 유지 + 일부 수정)
    # ------------------
    # ... (기존 get_user_by_id, get_user_by_email, create_user 등은 변경 없음) ...
    
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
    # 4. 퀴즈 관련 신규 메서드 (변경 없음)
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
            JOIN User T2 ON T1.creator_id = T2.id
            GROUP BY T1.creator_id, T2.username
            ORDER BY totalScore DESC;
        """
        # MariaDB는 랭킹을 직접 계산하지 않으므로, 애플리케이션 레벨에서 처리할 수 있도록 점수 데이터만 제공
        return self.execute_query(sql)
    
    # ------------------
    # 5. 공통 DB 메서드 (핵심 구현)
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

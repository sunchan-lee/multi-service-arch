# Multi-Service Architecture

마이크로서비스 아키텍처를 기반으로 한 통합 애플리케이션입니다.

## 🏗️ 아키텍처 구성

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  File Service   │    │Notification Svc │
│   (Node.js)     │    │ (Spring Boot)   │    │   (Python)      │
│                 │    │                 │    │                 │
│ • JWT 인증       │    │ • AWS S3 연동    │    │ • Naver Works   │
│ • Task CRUD     │    │ • 파일 업로드      │    │ • 알림 발송       │
│ • 라우팅          │    │ • 파일 관리       │    │ • 스케줄링        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    MongoDB      │
                    │                 │
                    │ • 사용자 데이터     │
                    │ • 할일 데이터      │
                    └─────────────────┘
```

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd multi-service-arch

# 환경변수 파일 생성
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요
```

### 2. Docker Compose로 실행
```bash
# 전체 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 상태 확인
docker-compose ps
```

### 3. API 문서 확인
- API Gateway: http://localhost:3000/api-docs
- File Service: http://localhost:8080/swagger-ui.html
- Notification Service: http://localhost:8000/docs

## 📁 프로젝트 구조

```
multi-service-arch/
├── docker-compose.yml        # 전체 서비스 통합 실행
├── docs/
│   ├── architecture.md       # 아키텍처 설명
│   └── diagram.png           # 서비스 다이어그램
│
├── gateway-node/             # Node.js API Gateway
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   ├── userRoutes.js     # JWT 인증
│   │   ├── taskRoutes.js     # Task CRUD
│   │   ├── fileRoutes.js     # 파일 업로드 요청 → Spring Boot 연동
│   │   └── notifyRoutes.js   # 알림 요청 → Python 서비스 연동
│   ├── controllers/
│   ├── middlewares/
│   ├── config/
│   └── Dockerfile
│
├── service-java/             # Spring Boot Service (AWS 연동)
│   ├── src/main/java/com/example/fileservice/
│   │   ├── FileController.java
│   │   ├── S3Service.java
│   │   └── ...
│   ├── pom.xml
│   └── Dockerfile
│
├── service-python/           # Python FastAPI Service (Naver Works Bot)
│   ├── main.py
│   ├── requirements.txt
│   ├── services/
│   │   ├── bot_service.py    # Bot 인증 & 메시지 발송
│   │   └── scheduler.py      # 주기적 알림 (예: 매일 9시)
│   └── Dockerfile
│
└── mongo/                    # MongoDB (데이터베이스)
    └── init-mongo.js         # 초기화 스크립트
```

## 🔧 환경변수 설정

### 필수 환경변수
```bash
# JWT 인증
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MongoDB
MONGO_URI=mongodb://admin:password123@mongo:27017/gateway_db?authSource=admin

# AWS S3 (File Service)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket
AWS_S3_REGION=us-east-1

# Naver Works Bot (Notification Service)
NAVER_WORKS_BOT_TOKEN=your_bot_token
NAVER_WORKS_API_URL=https://www.worksapis.com/v1.0
```

## 📚 API 사용법

### 1. 사용자 인증
```bash
# 회원가입
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 로그인
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. 할일 관리
```bash
# 할일 생성
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"새로운 할일","description":"할일 설명"}'

# 할일 목록 조회
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 파일 업로드
```bash
# 파일 업로드
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "description=파일 설명"
```

### 4. 알림 발송
```bash
# 즉시 알림
curl -X POST http://localhost:3000/api/notify/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"새로운 할일이 추가되었습니다","channel":"general"}'

# 예약 알림
curl -X POST http://localhost:3000/api/notify/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"매일 오전 9시 할일 체크","schedule_time":"09:00","repeat":"daily"}'
```

## 🛠️ 개발 가이드

### 로컬 개발 환경 설정
```bash
# 각 서비스별로 개별 실행
cd gateway-node && npm install && npm run dev
cd service-java && ./mvnw spring-boot:run
cd service-python && pip install -r requirements.txt && python main.py
```

### 새로운 서비스 추가
1. 서비스 디렉터리 생성
2. Dockerfile 작성
3. docker-compose.yml에 서비스 추가
4. API Gateway에 라우트 추가

## 🔍 모니터링 및 디버깅

### 헬스 체크
- API Gateway: http://localhost:3000/health
- File Service: http://localhost:8080/actuator/health
- Notification Service: http://localhost:8000/health

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f gateway-node
docker-compose logs -f service-java
docker-compose logs -f service-python
```

## 🚀 배포

### 프로덕션 배포
```bash
# 프로덕션 환경변수 설정
export NODE_ENV=production
export JWT_SECRET=your-production-secret

# 서비스 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


# Multi-Service Architecture 문서

## 개요

이 프로젝트는 마이크로서비스 아키텍처를 기반으로 한 통합 애플리케이션입니다. 각 서비스는 독립적으로 개발, 배포, 확장이 가능하며, API Gateway를 통해 통합 관리됩니다.

## 아키텍처 구성

### 1. API Gateway (Node.js)
- **역할**: 모든 클라이언트 요청의 진입점
- **기술 스택**: Node.js, Express.js, JWT 인증
- **주요 기능**:
  - 사용자 인증 및 JWT 토큰 관리
  - 할일(Task) CRUD 작업
  - 다른 마이크로서비스로의 요청 라우팅
  - Swagger API 문서화

### 2. File Service (Spring Boot)
- **역할**: 파일 업로드/다운로드 관리
- **기술 스택**: Spring Boot, AWS S3, JPA
- **주요 기능**:
  - 파일 업로드 및 S3 저장
  - 파일 다운로드 URL 생성
  - 파일 목록 조회 및 삭제
  - AWS S3 연동

### 3. Notification Service (Python FastAPI)
- **역할**: 알림 및 메시지 발송
- **기술 스택**: Python, FastAPI, APScheduler
- **주요 기능**:
  - Naver Works Bot 연동
  - 즉시 알림 발송
  - 예약 알림 설정 및 관리
  - 주기적 알림 (매일 9시 할일 체크 등)

### 4. Database (MongoDB)
- **역할**: 데이터 저장소
- **기술 스택**: MongoDB 7.0
- **주요 기능**:
  - 사용자 정보 저장
  - 할일 데이터 저장
  - 인덱스 최적화

## 서비스 간 통신

### API Gateway → File Service
```
POST /api/files/upload
GET /api/files
DELETE /api/files/{fileName}
```

### API Gateway → Notification Service
```
POST /api/notify/send
POST /api/notify/schedule
GET /api/notify/scheduled
```

## 데이터 흐름

1. **사용자 인증**
   - 클라이언트 → API Gateway → JWT 토큰 발급

2. **할일 관리**
   - 클라이언트 → API Gateway → MongoDB (직접 접근)

3. **파일 업로드**
   - 클라이언트 → API Gateway → File Service → AWS S3

4. **알림 발송**
   - 클라이언트 → API Gateway → Notification Service → Naver Works Bot

## 보안

- **JWT 토큰 기반 인증**: 모든 보호된 엔드포인트에 JWT 인증 적용
- **CORS 설정**: 클라이언트 도메인 간 요청 허용
- **환경변수**: 민감한 정보는 환경변수로 관리

## 배포

### Docker Compose를 통한 로컬 배포
```bash
# 전체 서비스 실행
docker-compose up -d

# 특정 서비스만 실행
docker-compose up -d gateway-node mongo

# 로그 확인
docker-compose logs -f gateway-node
```

### 환경변수 설정
```bash
# .env 파일 생성
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket
NAVER_WORKS_BOT_TOKEN=your_bot_token
```

## 모니터링

- **헬스 체크**: 각 서비스의 `/health` 엔드포인트
- **API 문서**: `http://localhost:3000/api-docs`
- **로그**: Docker Compose를 통한 중앙화된 로그 관리

## 확장성

- **수평 확장**: 각 서비스를 독립적으로 스케일링 가능
- **로드 밸런싱**: Nginx를 통한 트래픽 분산
- **데이터베이스 샤딩**: MongoDB 클러스터 구성 가능

## 개발 가이드

### 새로운 서비스 추가
1. 서비스 디렉터리 생성
2. Dockerfile 작성
3. docker-compose.yml에 서비스 추가
4. API Gateway에 라우트 추가

### API 문서 업데이트
- Swagger JSDoc 주석을 라우트 파일에 추가
- `http://localhost:3000/api-docs`에서 확인

## 트러블슈팅

### 일반적인 문제
1. **서비스 간 통신 실패**: 네트워크 설정 및 포트 확인
2. **JWT 토큰 오류**: JWT_SECRET 환경변수 확인
3. **MongoDB 연결 실패**: 연결 문자열 및 인증 정보 확인
4. **AWS S3 접근 실패**: AWS 자격 증명 확인
5. **Naver Works Bot 오류**: Bot 토큰 및 API URL 확인


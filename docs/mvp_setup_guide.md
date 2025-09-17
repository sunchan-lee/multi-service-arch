# MVP Setup & Run Guide

이 문서는 현재 시점에서 **MVP (Minimum Viable Product)**를 유지하고 실행하기 위한 설정 및 절차를 정리한 것입니다.

---

## 1. 서비스 구성 요소
- **gateway-node**: API Gateway (Express.js)
- **service-python**: 알림/네이버웍스 연동 서비스
- **service-java**: 파일 업로드 서비스 (Spring Boot, AWS S3)
- **service-mongo**: 데이터 저장소 (MongoDB)

---

## 2. 환경 변수 정리

### 공통
- 모든 서비스는 해당 서비스 디렉토리(`service-python`, `service-java`) 안에서 실행해야 함.

### Python 서비스 (`service-python/.env`)
```env
NAVER_WORKS_BOT_ID=10768233
NAVER_WORKS_BOT_SECRET=...
NAVER_WORKS_API_URL=https://auth.worksmobile.com
NAVER_WORKS_CLIENT_ID=...
NAVER_WORKS_CLIENT_SECRET=...
NAVER_WORKS_SERVICE_ACCOUNT=...
NAVER_WORKS_PRIVATE_KEY_PATH=.../private_xxxxx.key
NAVER_WORKS_USER_ID=admin@suntest.shop
```

### Java 서비스 (`service-java/src/main/resources/application.properties`)
```properties
# AWS S3 설정
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
aws.s3.bucket-name=${AWS_S3_BUCKET_NAME}
aws.s3.region=${AWS_S3_REGION:ap-southeast-2}
```

**환경 변수 확인 (로컬에서 실행 전)**
```bash
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET_NAME
echo $AWS_S3_REGION
```

---

## 3. 실행 방법

### MongoDB (로컬 실행)
```bash
brew services start mongodb-community@7.0
```

### service-java (파일 서비스)
```bash
cd service-java
mvn spring-boot:run
```

### service-python (알림 서비스)
```bash
cd service-python
python3 main.py
```

테스트 실행:
```bash
python3 test_notify.py
python3 test_user.py
```

### gateway-node (API Gateway)
```bash
cd gateway-node
npm install
npm start
```

---

## 4. End-to-End 테스트 절차

1. Swagger UI 진입 → JWT 발급 (예: johndoe 계정)
2. `/task` POST API 호출 (Task 등록)
3. Task → File Service (S3 업로드) → MongoDB 저장
4. Notify Service 호출 → 네이버웍스 `admin@suntest.shop` 계정으로 알림 전송 확인

---

## 5. 현재 상태 (MVP 기준)
- ✅ JWT 인증 및 Gateway 정상 동작
- ✅ MongoDB 연동 정상
- ✅ S3 파일 업로드 정상
- ✅ 네이버웍스 알림 전송 (Fallback user = `admin@suntest.shop`) 정상
- ⚠️ 다중 사용자/계정별 알림 매핑은 추후 확장 예정

---

## 6. 다음 단계 (차후 확장)
- 사용자별 네이버웍스 계정 매핑 로직 구현
- 알림 실패 시 로깅 및 재시도 메커니즘 추가
- Docker Compose 환경으로 통합 실행 지원
- README.md를 기반으로 배포 자동화 문서화
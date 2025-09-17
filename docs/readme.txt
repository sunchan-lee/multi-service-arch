# MVP 시스템 운영 규칙 (2025-09 기준)

본 문서는 멀티 서비스 아키텍처 MVP 단계에서 적용되는 제약 사항 및 운영 규칙을 정리한 것입니다.  
Swagger API 문서는 스펙 설명에 집중하고, 실제 운영/테스트 제약 사항은 본 문서에서 관리합니다.  

---

## 1. 사용자/알림 규칙
- **알림 수신자**: 항상 `admin@suntest.shop` 으로 고정
  - Swagger 상에서 다른 계정(`johndoe@example.com` 등)을 입력해도 무시됨
  - Gateway → Python → NAVER WORKS 구간에서 최종적으로 `admin@suntest.shop` 계정으로 알림 발송됨
- 추후 단계에서 여러 사용자 지원 예정

---

## 2. 인증/토큰 발급
- NAVER WORKS OAuth2 JWT 방식으로 토큰 발급 성공
- `test_user.py`, `test_notify.py` 정상 동작 확인
- Access Token 발급 로직:  
  - CLIENT_ID: `cNDdvU4okR4RbxOSkNLp`
  - SERVICE_ACCOUNT: `s733p.serviceaccount@suntest.shop`
  - Private Key: `private_20250731175819.key`
- 토큰은 Python 서비스에서 관리

---

## 3. 파일 업로드 서비스 (File Service, Java)
- 업로드된 파일은 **AWS S3**에 저장
- 버킷명: `mytestawsbucket9292`
- 리전: `ap-southeast-2`
- 업로드 경로: `uploads/{UUID}_{파일명}`
- 업로드 후 URL 예시:  
https://mytestawsbucket9292.s3.ap-southeast-2.amazonaws.com/uploads/{UUID}_{filename}


---

## 4. Gateway
- Task 생성 시 다음 흐름으로 동작
1. Swagger → Gateway → File Service → S3 업로드
2. MongoDB에 Task 정보 저장
3. Python Service를 통해 NAVER WORKS 알림 발송
- 최종적으로 admin 계정으로 알림 수신 확인

---

## 5. 현재 상태
- ✅ 토큰 발급 정상 동작
- ✅ test_user, test_notify 정상 동작
- ✅ File Service (Java) S3 업로드 정상 동작
- ✅ Gateway ↔ Python ↔ NAVER WORKS 알림 정상 동작
- ✅ End-to-End 테스트 성공 (Swagger → NAVER WORKS 알림)

---

## 6. 향후 개선 예정
- 알림 대상 다계정 지원
- Swagger 상의 userId 입력값 반영 (현재는 무시됨)
- 운영 단계에서 환경 변수 관리 강화 (Secrets Manager 등 도입 고려)

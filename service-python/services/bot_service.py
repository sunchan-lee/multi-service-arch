"""
Naver Works Bot 서비스
- 목적: OAuth 토큰 발급 및 사용자 메시지 발송
- 환경: .env의 자격증명 사용, 개인키 파일로 JWT 생성
"""

import os
import json
import time
import jwt
import requests
from dotenv import load_dotenv

load_dotenv()

# ✅ 환경 변수
CLIENT_ID = os.getenv("NAVER_WORKS_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_WORKS_CLIENT_SECRET")
SERVICE_ACCOUNT = os.getenv("NAVER_WORKS_SERVICE_ACCOUNT")
PRIVATE_KEY_PATH = os.getenv("NAVER_WORKS_PRIVATE_KEY_PATH")
BOT_ID = os.getenv("NAVER_WORKS_BOT_ID")

# ✅ fallback 유저 (항상 메시지를 받을 기본 대상)
FALLBACK_USER_ID = os.getenv("NAVER_WORKS_USER_ID")

TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token"

_cached_token = None
_token_expiry = 0


# 🔑 Access Token 발급 함수
# - 캐시 사용으로 불필요한 토큰 재발급 최소화
def get_access_token():
    global _cached_token, _token_expiry

    # 캐시된 토큰이 유효하면 그대로 사용
    if _cached_token and _token_expiry > time.time():
        return _cached_token

    with open(PRIVATE_KEY_PATH, "r") as f:
        private_key = f.read()

    now = int(time.time())
    payload = {
        "iss": CLIENT_ID,
        "sub": SERVICE_ACCOUNT,
        "iat": now,
        "exp": now + 3600,
        "aud": TOKEN_URL,
    }

    client_assertion = jwt.encode(payload, private_key, algorithm="RS256")

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "bot user directory",
        "assertion": client_assertion
    }
    print("🔑 CLIENT_ID:", CLIENT_ID)
    print("🔑 SERVICE_ACCOUNT:", SERVICE_ACCOUNT)
    print("📂 PRIVATE_KEY_PATH:", PRIVATE_KEY_PATH)
    print("📨 Sending token request with data:", data)

    res = requests.post(TOKEN_URL, data=data, headers=headers)
    print("🔍 Response:", res.status_code, res.text)

    res.raise_for_status()
    token_data = res.json()

    now = int(time.time())
    expires_in = int(token_data.get("expires_in", 3600))  # 문자열 → 정수 변환
    _token_expiry = now + expires_in - 60  # expire 조금 앞당김

    return token_data["access_token"]





def send_message(user_id: str, message: str):
    """
    지정한 사용자에게 텍스트 메시지를 전송합니다.
    - user_id는 현재 FALLBACK_USER_ID로 대체되어 고정 전송됩니다.
    """
    token = get_access_token()

    # ✅ 무조건 admin@suntest.shop 으로 고정
    target_user = FALLBACK_USER_ID  

    url = f"https://www.worksapis.com/v1.0/bots/{BOT_ID}/users/{target_user}/messages"
    headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": f"Bearer {token}",
    }
    body = {
        "content": {
            "type": "text",
            "text": message,
        }
    }

    res = requests.post(url, headers=headers, json=body)
    print("🔍 Response status:", res.status_code)
    print("🔍 Response body:", res.text)

    res.raise_for_status()
    return res.json() if res.text else {"status": "no response"}

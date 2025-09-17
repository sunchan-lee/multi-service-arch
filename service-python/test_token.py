import os
import time
import jwt
import requests
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("NAVER_WORKS_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_WORKS_CLIENT_SECRET")
SERVICE_ACCOUNT = os.getenv("NAVER_WORKS_SERVICE_ACCOUNT")
PRIVATE_KEY_PATH = os.getenv("NAVER_WORKS_PRIVATE_KEY_PATH")

NAVER_WORKS_API_URL = "https://auth.worksmobile.com"

with open(PRIVATE_KEY_PATH, "r") as f:
    PRIVATE_KEY = f.read()

def get_access_token():
    now = int(time.time())
    payload = {
        "iss": CLIENT_ID,
        "sub": SERVICE_ACCOUNT,
        "iat": now,
        "exp": now + 3600,
        "aud": f"{NAVER_WORKS_API_URL}/oauth2/v2.0/token"
    }

    assertion = jwt.encode(payload, PRIVATE_KEY, algorithm="RS256")

    url = f"{NAVER_WORKS_API_URL}/oauth2/v2.0/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": assertion,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "bot user directory"
    }

    res = requests.post(url, headers=headers, data=data)
    res.raise_for_status()
    return res.json()

if __name__ == "__main__":
    token_response = get_access_token()
    print("✅ Access Token 발급 성공!")
    print("발급 응답:", token_response)
    print("Access Token 앞 50자:", token_response["access_token"][:50])

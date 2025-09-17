import requests
from services.bot_service import get_access_token

def list_users():
    token = get_access_token()
    url = "https://www.worksapis.com/v1.0/users"
    headers = {"Authorization": f"Bearer {token}"}

    res = requests.get(url, headers=headers)
    print("🔍 Status:", res.status_code)
    print("🔍 Body:", res.text)

    if res.status_code == 200:
        users = res.json().get("users", [])
        for u in users:
            print(f"✅ userId: {u.get('userId')} | name: {u.get('name')} | email: {u.get('email')}")
    else:
        print("❌ Failed to fetch users")

if __name__ == "__main__":
    list_users()

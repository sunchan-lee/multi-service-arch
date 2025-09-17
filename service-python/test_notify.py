from services.bot_service import send_message

if __name__ == "__main__":
    user_id = "admin@suntest.shop"  # 네이버웍스 계정 ID
    message = "✅ Python Notification Service에서 보낸 테스트 메시지!"
    response = send_message(user_id, message)
    print("메시지 전송 응답:", response)

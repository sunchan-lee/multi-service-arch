import schedule
import time
from services.bot_service import send_message

def daily_reminder():
    send_message("target_user_id", "오늘 할 일을 확인하세요! ✅")

schedule.every().day.at("09:00").do(daily_reminder)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

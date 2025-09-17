from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.bot_service import send_message

app = FastAPI()

class NotificationRequest(BaseModel):
    userId: str
    message: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/notify")
async def notify(req: NotificationRequest):
    try:
        response = send_message(req.userId, req.message)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

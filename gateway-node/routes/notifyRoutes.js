// 알림 라우터
// - 목적: Gateway에서 Python Notification 서비스로 이벤트 전달
// - 사용처: 새로운 Task 생성 등 이벤트 기반 알림 발송
const express = require("express");
const axios = require("axios");
const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// Task 생성 이벤트 → Notification 서비스에 위임하여 메시지 발송
router.post("/task-created", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/notify/task-created`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Notification service unavailable", error: error.message });
  }
});

module.exports = router;

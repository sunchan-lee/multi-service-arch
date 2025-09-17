const Task = require("../models/Task");
const axios = require("axios");

// Python Notification Service URL
const NOTIFY_SERVICE_URL = process.env.NOTIFY_SERVICE_URL || "http://localhost:8000/notify";

// ✅ Task 생성
exports.createTask = async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    const task = new Task({ title, description, userId });
    await task.save();

    // 알림 서비스 호출
    try {
      await axios.post(NOTIFY_SERVICE_URL, {
        user_id: userId,
        message: `📌 새로운 Task가 등록되었습니다: ${title}`
      });
    } catch (err) {
      console.error("⚠️ 알림 서비스 호출 실패:", err.message);
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Task 완료 처리
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(
      id,
      { completed: true },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    // 알림 서비스 호출
    try {
      await axios.post(NOTIFY_SERVICE_URL, {
        user_id: task.userId,
        message: `✅ Task 완료: ${task.title}`
      });
    } catch (err) {
      console.error("⚠️ 알림 서비스 호출 실패:", err.message);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 모든 Task 조회
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Task 단일 조회
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Task 수정
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Task 삭제
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

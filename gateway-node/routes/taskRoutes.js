const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Task = require("../models/Task");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const upload = multer();

// ✅ 외부 서비스 URL
const JAVA_SERVICE_URL = process.env.JAVA_SERVICE_URL || "http://localhost:8080";
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs with file upload & notifications
 */

router.use(protect); // ✅ 모든 Task API는 JWT 인증 필요

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task with optional file upload & send notification
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Task created successfully
 */
// ✅ Task 생성
router.post("/", upload.single("file"), async (req, res) => {
  try {
    let fileUrl = null;

    // ✅ 파일 업로드 → Spring Boot File Service
    if (req.file) {
      const formData = new FormData();
      formData.append("file", req.file.buffer, req.file.originalname);

      const response = await axios.post(`${JAVA_SERVICE_URL}/files/upload`, formData, {
        headers: formData.getHeaders(),
      });

      fileUrl = response.data.url;
    }

    // ✅ Task 생성 (title + description + fileUrl)
    const task = new Task({
      title: req.body.title,
      description: req.body.description || "",   // description 반영
      fileUrl,
      user: req.user._id,
    });

    await task.save();


    // ✅ Python Notification Service 호출
    try {
      await axios.post(`${PYTHON_SERVICE_URL}/notify`, {
        userId: req.user.email || req.user._id, 
        message: `📌 새로운 할 일이 등록되었습니다: ${task.title}\n📝 ${task.description}`,
      });
    } catch (notifyErr) {
      console.warn("⚠️ Notification service unavailable:", notifyErr.message);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error("Task creation failed:", err.message);
    res.status(500).json({ error: "Task creation failed" });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
// ✅ 모든 Task 조회
router.get("/", async (req, res) => {
  try {
    // 🔧 임시로 모든 Task 반환 (MVP)
    const tasks = await Task.find(); 
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 */
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by ID (with optional new file upload)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // ✅ 새 파일 업로드 시 fileUrl 갱신
    if (req.file) {
      const formData = new FormData();
      formData.append("file", req.file.buffer, req.file.originalname);

      const response = await axios.post(`${JAVA_SERVICE_URL}/files/upload`, formData, {
        headers: formData.getHeaders(),
      });

      updateData.fileUrl = response.data.url;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err) {
    console.error("Task update failed:", err.message);
    res.status(500).json({ error: "Failed to update task" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   put:
 *     summary: Mark a task as completed
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task marked as completed
 *       404:
 *         description: Task not found
 */
router.put("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { completed: true },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    // ✅ Task 완료 시 알림
    try {
      await axios.post(`${PYTHON_SERVICE_URL}/notify`, {
        userId: req.user.email || req.user._id,
        message: `✅ Task 완료: ${task.title}`,
      });
    } catch (notifyErr) {
      console.warn("⚠️ Notification service unavailable:", notifyErr.message);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to complete task" });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;

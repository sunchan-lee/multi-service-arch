const express = require("express");
const axios = require("axios");
const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

router.post("/task-created", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/notify/task-created`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Notification service unavailable", error: error.message });
  }
});

module.exports = router;

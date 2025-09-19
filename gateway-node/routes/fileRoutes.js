const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer(); // 메모리 저장소

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload APIs (via Spring Boot S3 Service)
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload file to S3
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       500:
 *         description: File service unavailable
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      `${process.env.JAVA_SERVICE_URL}/files/upload`,
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(response.data);
  } catch (err) {
    console.error("File upload failed:", err.message);
    res.status(500).json({ error: "File service unavailable" });
  }
});

module.exports = router;

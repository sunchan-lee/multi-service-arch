const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  fileUrl: { type: String } // ✅ 첨부파일 URL
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);

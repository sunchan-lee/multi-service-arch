const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const fileRoutes = require("./routes/fileRoutes");
const notifyRoutes = require("./routes/notifyRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-Service Gateway API",
      version: "1.0.0",
      description: "Node.js Gateway with JWT + Proxy",
    },
    servers: [{ url: "http://localhost:5001" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 라우트 연결
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/files", fileRoutes);     // Spring Boot
app.use("/api/notify", notifyRoutes);  // Python

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));


// const User = require("./models/User");
// User.find().then(users => console.log(users));

const healthRoutes = require("./routes/healthRoutes");
app.use("/", healthRoutes);
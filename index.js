import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// All Route Imports
import foodRouter from "./routes/foodRoute.js";
import authRouter from "./routes/authRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";

// DB and Middleware
import ConnectDB from "./setting/db.js";
import errorMiddleware from "./middlewares/errors.js";

// Setup __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
ConnectDB();

// CORS Configuration
const FRONTEND_URL = "https://aworfood-frontend.vercel.app";
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.options("*", cors({
  origin: FRONTEND_URL,
  credentials: true,
}));


// Parse JSON and preserve raw body (for Stripe, etc.)
app.use(express.json({
    limit: "50mb",
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

app.use(cookieParser());

// Routes
app.use("/api/v1", foodRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRoute);

// // Serve frontend in production
// if (process.env.NODE_ENV === "PRODUCTION") {
//     app.use(express.static(path.join(__dirname, "../frontend/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
//     });
// }

// 404 handler for unknown routes with CORS headers
app.use((req, res) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(404).json({ message: "Route not found" });
  });

// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server has started on Port: ${process.env.PORT}`);
});

// // 💥 Handle Uncaught Exceptions
// process.on('uncaughtException', err => {
//     console.log(`ERROR: ${err.message}`);
//     console.log('UNCAUGHT EXCEPTION! 🔥 Shutting down this server...');
//     server.close(() => {
//         process.exit(1);
//     });
// });

// // 💥 Handle Unhandled Promise Rejections
// process.on('unhandledRejection', err => {
//     console.log(`ERROR: ${err.stack}`);
//     console.log('UNHANDLED REJECTION! 💥 Shutting down this server...');
//     server.close(() => {
//         process.exit(1);
//     });
// });

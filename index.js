import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";


// All Route Imports
import foodRouter from "./routes/foodRoute.js";
import authRouter from "./routes/authRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";

// DB and Middleware
import ConnectDB from "./setting/db.js";
import errorMiddleware from "./middlewares/errors.js";


// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
ConnectDB();


app.use(cors({ origin: "https://aworfood-frontend.vercel.app", credentials: true }));

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



// Error handling middleware
app.use(errorMiddleware);


app.get("/", (req, res) => {
    res.send("Hello aworfood Server is Running!");
  });

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server has started on Port: ${process.env.PORT}`);
});


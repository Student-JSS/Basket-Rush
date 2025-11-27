import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";

import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./routes/userRoute.js";
import authMiddleware from "./middleware/auth.js";
import itemRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";



const app = express();
const port = process.env.PORT || 4000;

// Correct ES module dirname handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// DATABASE
// ======================
connectDB();

// ======================
// STATIC FILES
// ======================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================
// ROUTES
// ======================
app.use("/api/user", userRouter);
app.use('/api/cart', authMiddleware,cartRouter);
app.use("/api/items", itemRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// ======================
// SERVER
// ======================
app.listen(port, () => {
  console.log(`Server started → http://localhost:${port}`);
});

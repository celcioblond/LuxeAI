import express from "express"
import morgan from "morgan";
import products from "./routes/products.js";
import users from "./routes/users.js";
import cors from "cors";
import bodyParser from "body-parser";
import HttpError from "./models/http-error.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {connectDB } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/api/products", products);
app.use("/api/users", users);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
})


app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({message: error.message || "Unknown error occurred"});
});

await connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

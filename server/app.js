import express from "express"
import morgan from "morgan";
import products from "./routes/products.js";
import users from "./routes/users.js";
import cors from "cors";
import bodyParser from "body-parser";
import HttpError from "./models/http-error.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/api/products", products);
app.use("api/users", users);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
})


app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({message: error.message || "Unknown error occurred"});
})

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
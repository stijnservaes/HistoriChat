import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes"
dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/auth", authRouter)



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});

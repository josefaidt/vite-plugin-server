import express from "express";

export const app = express();
const api = express.Router();

api.get("/hello", (req, res) => {
  res.send("Hello world");
});

app.use("/api", api);

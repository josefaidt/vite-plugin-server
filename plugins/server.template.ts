import express from "express";
import { app } from "$app";

const server = express();
server.use(express.static("."));
server.use(app);

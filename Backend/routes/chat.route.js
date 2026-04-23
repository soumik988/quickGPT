import express from "express";

import { protect } from "../middlewares/auth.js";
import {
  createChat,
  deleteChat,
  getChats,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.get("/create", protect, createChat);
chatRouter.get("/get", protect, getChats);
chatRouter.get("/delete", protect, deleteChat);

export default chatRouter;
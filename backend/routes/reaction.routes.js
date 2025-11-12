import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { addReaction, removeReaction } from "../controllers/reaction.controllers.js";

const router = express.Router();

router.route("/")
  .post(protect, addReaction);

router.route("/:id")
  .delete(protect, removeReaction);

export default router;

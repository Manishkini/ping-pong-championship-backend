import { Router } from "express";
import { start } from "../controllers/game.js";
import { verifyReferee } from "../middlewares/authentication.js";

const router = Router();

router.get("/:game_id/start", verifyReferee, start)

export default router;
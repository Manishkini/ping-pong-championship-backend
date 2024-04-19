import { Router } from "express";
import { start, get } from "../controllers/game.js";
import { verifyReferee, verify } from "../middlewares/authentication.js";

const router = Router();

router.get("/:game_id/start", verify, start)

router.get("/:game_id", verify, get)

export default router;
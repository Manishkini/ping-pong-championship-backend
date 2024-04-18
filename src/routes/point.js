import { Router } from "express";
import { verify, verifyPlayer, verifyReferee } from "../middlewares/authentication.js";
import { lastRound, recordNewPoint, recordDefensePoint, roundWinner } from "../controllers/point.js";

const router = Router();

router.get("/:game_id/lastRound", verify, lastRound)

router.post("/:game_id/new", verifyPlayer, recordNewPoint)

router.post("/:game_id/defensePoint", verifyPlayer, recordDefensePoint)

router.get("/:game_id/roundWinner/:round_number", verifyReferee, roundWinner)

export default router;
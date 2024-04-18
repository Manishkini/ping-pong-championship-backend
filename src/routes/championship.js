import { Router } from "express";
import { create, invite, playerJoining, start, getAllChampionshipsByStatus, getAllGamesByChampionshipId } from '../controllers/championship.js'
import { verifyReferee } from "../middlewares/authentication.js";

const router = Router();

router.post("/", verifyReferee, create);

router.get("/:id/invite", verifyReferee, invite);

router.get("/:id/join/:player_id", verifyReferee, playerJoining);

router.get("/:id/start", verifyReferee, start);

router.get("/:status?", verifyReferee, getAllChampionshipsByStatus);

router.get("/:championship_id/games", verifyReferee, getAllGamesByChampionshipId);

export default router;
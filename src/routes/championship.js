import { Router } from "express";
import { 
    create, 
    invite, 
    playerJoining, 
    start, 
    getAllChampionshipsByStatus, 
    getAllGamesByChampionshipId, 
    getPlayers, 
    get,
    createDraw
} from '../controllers/championship.js'
import { verifyReferee, verify, verifyPlayer } from "../middlewares/authentication.js";

const router = Router();

router.post("/", verifyReferee, create);

router.get("/:id/invite", verifyReferee, invite);

router.get("/players", verifyReferee, getPlayers);

router.get("/:id", verify, get);

router.get("/:id/join/:player_id", verifyPlayer, playerJoining);

router.get("/:id/start", verifyReferee, start);

router.get("/:status?", verify, getAllChampionshipsByStatus);

router.get("/:championship_id/games", verify, getAllGamesByChampionshipId);

router.get("/:championship_id/draw/:type", verifyReferee, createDraw);

export default router;
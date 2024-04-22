import Championship from "../models/championships.js";
import Game from "../models/games.js";
import mongoose from "mongoose";
import { draw } from "../utils/draw.js";
import Point from "../models/points.js";
import { emitEvent } from "../configs/socket.js";
const ObjectId = mongoose.Types.ObjectId;

export const start = async (req, res) => {
    try {
        const { game_id } = req.params;

        const isGameFound = await Game.findById(game_id);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        if(isGameFound.status !== "Initiated") {
            return res.status(200).send({ massage: `Game is already started or finished.` })
        }

        await Game.updateOne({ _id: game_id }, { $set: { status: "Started" } })

        const point = await Point.create({ 
            game_id, 
            attack: { player_id: isGameFound.first_player }, 
            defense: { player_id: isGameFound.second_player },
            round_number: 1
        })

        emitEvent(isGameFound.championship_id, { game_id, status: "Started" })

        return res.status(200).send({ massage: `Game started successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const get = async (req, res) => {
    try {
        const { game_id } = req.params;

        const isGameFound = await Game.findById(game_id)
        .populate(["championship_id", "first_player", "second_player", "Winner", "Loser"]);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        return res.status(200).send({ game: isGameFound, massage: `Game fetched successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}
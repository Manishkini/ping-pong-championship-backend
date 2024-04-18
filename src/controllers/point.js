import Game from "../models/games.js";
import Point from "../models/points.js";
import mongoose from "mongoose";
import { draw } from "../utils/draw.js";
const ObjectId = mongoose.Types.ObjectId;

export const lastRound = async (req, res) => {
    try {
        const { game_id } = req.params;

        const point = await Game.findOne({ _id: game_id }).sort({ createdAt: -1 }).limit(1);

        return res.status(200).send({ point, massage: `Last point fetched successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const recordNewPoint = async (req, res) => {
    try {
        const { game_id } = req.params;
        const { attack_player_id, selected_number, round_number } = req.body;

        const isGameFound = await Game.findById(game_id);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        if(isGameFound.Winner) {
            return res.status(200).send({ massage: `Game winner is already declared.` })
        }

        const point = await Point.create({ game_id, attack: { player_id: attack_player_id, selected_number }, round_number });

        return res.status(200).send({ point, massage: `New point added successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const recordDefensePoint = async (req, res) => {
    try {
        const { game_id } = req.params;
        const { defense_player_id, defense_array, round_number } = req.body;

        const isGameFound = await Game.findById(game_id);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        if(isGameFound.Winner) {
            return res.status(200).send({ massage: `Game winner is already declared.` })
        }

        const point = await Point.updateOne(
            { game_id, round_number },
            { defense: { player_id: defense_player_id, defense_array } }
        );

        return res.status(200).send({ point, massage: `New point added successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const roundWinner = async (req, res) => {
    try {
        const { game_id, round_number } = req.params;
        let first_player_winnings, second_player_winnings, game_winner, game_loser;

        const isPointFound = await Point.findOne({ game_id, round_number });

        if(!isPointFound) {
            return res.status(200).send({ massage: `Point not found.` })
        }

        const game = await Game.findById(game_id, { first_player: 1, second_player: 1 });

        const selectedNumber = isPointFound.attack.selected_number;
        const defenseArray = isPointFound.defense.defense_array;
        let round_winner, round_loser;

        if(defenseArray.includes(selectedNumber)) {
            round_winner = isPointFound.defense.player_id;
            round_loser = isPointFound.attack.player_id;
        } else {
            round_winner = isPointFound.attack.player_id;
            round_loser = isPointFound.defense.player_id;
        }

        await Point.updateOne({ game_id, round_number }, { $set: { round_winner, round_loser } });

        if(round_winner || round_loser) {
            first_player_winnings = await Point.countDocuments({ round_winner: game.first_player });
            second_player_winnings = await Point.countDocuments({ round_winner: game.second_player });
        }

        if(first_player_winnings === 5 || second_player_winnings === 5) {
            game_winner = first_player_winnings === 5 ? game.first_player : game.second_player
            game_loser = first_player_winnings === 5 ? game.second_player : game.first_player
            await Game.updateOne({ _id: game_id }, { $set: { Winner: game_winner, Loser: game_loser } })
        }
        
        return res.status(200).send({
            round_winner, 
            round_loser, 
            first_player_winnings, 
            second_player_winnings, 
            game_winner, 
            massage: `Current Round Winner Declared`
        })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}
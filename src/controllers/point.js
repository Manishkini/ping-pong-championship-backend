import Game from "../models/games.js";
import Point from "../models/points.js";
import mongoose from "mongoose";
import { draw } from "../utils/draw.js";
import { emitEvent } from "../configs/socket.js";
const ObjectId = mongoose.Types.ObjectId;

export const lastRound = async (req, res) => {
    try {
        const { game_id } = req.params;

        const isGameFound = await Game.findById(game_id);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        const point = await Point.findOne({ game_id })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate({
            path: 'attack',
            populate: {
                path: 'player_id',
                model: 'Player'
            }
        }).populate({
            path: 'defense',
            populate: {
                path: 'player_id',
                model: 'Player'
            },
        });

        const total_win_first = await Point.countDocuments({ round_winner: isGameFound.first_player._id });
        const total_win_second = await Point.countDocuments({ round_winner: isGameFound.second_player._id });

        return res.status(200).send({ point, total_win_first, total_win_second, massage: `Last point fetched successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const recordNewPoint = async (req, res) => {
    try {
        const { game_id, point_id } = req.params;
        const { attack_player_id, selected_number, round_number } = req.body;

        const isGameFound = await Game.findById(game_id);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        if(isGameFound.Winner) {
            return res.status(200).send({ massage: `Game winner is already declared.` })
        }

        const isPointFound = await Point.findById(point_id);

        if(!isPointFound) {
            return res.status(200).send({ massage: `Point not found.` })
        }

        const point = await Point.updateOne(
            { _id: isPointFound._id },
            {
                $set: {
                    attack: { player_id: attack_player_id, selected_number },
                    round_number
                }
            }
        );

        emitEvent(game_id, { for: "Referee", role: "Attacker", attack_player_id, selected_number, round_number });

        return res.status(200).send({ point, massage: `New point added successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const recordDefensePoint = async (req, res) => {
    try {
        const { game_id, point_id } = req.params;
        const { defense_player_id, defense_array, round_number } = req.body;

        const isGameFound = await Game.findById(game_id);

        if(!isGameFound) {
            return res.status(200).send({ massage: `Game not found.` })
        }

        if(isGameFound.Winner) {
            return res.status(200).send({ massage: `Game winner is already declared.` })
        }

        const isPointFound = await Point.findById(point_id);

        if(!isPointFound) {
            return res.status(200).send({ massage: `Point not found.` })
        }

        const point = await Point.updateOne(
            { _id: isPointFound._id },
            { 
                $set: {
                    defense: { player_id: defense_player_id, defense_array }
                }
            }
        );

        emitEvent(game_id, { for: "Referee", role: "Defense", defense_player_id, defense_array, round_number });

        return res.status(200).send({ point, massage: `New point added successfully` })
    } catch(error) {
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}

export const roundWinner = async (req, res) => {
    try {
        const { game_id, point_id } = req.params;
        let first_player_winnings, second_player_winnings, game_winner, game_loser;

        const isPointFound = await Point.findById(point_id);
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

        await Point.updateOne({ _id: isPointFound._id }, { $set: { round_winner, round_loser } });

        if(round_winner || round_loser) {
            first_player_winnings = await Point.countDocuments({ round_winner: game.first_player });
            second_player_winnings = await Point.countDocuments({ round_winner: game.second_player });
        }

        // If some one wins
        if(first_player_winnings === 5 || second_player_winnings === 5) {
            game_winner = first_player_winnings === 5 ? game.first_player : game.second_player
            game_loser = first_player_winnings === 5 ? game.second_player : game.first_player
            await Game.updateOne({ _id: game_id }, { $set: { Winner: game_winner, Loser: game_loser } })

            emitEvent(game_id, {
                for: "Player",
                game_id,
                game_winner,
                game_loser
            })

            return res.status(200).send({
                round_winner,
                round_loser,
                first_player_winnings, 
                second_player_winnings, 
                game_winner,
                game_loser,
                massage: `Current Round Winner Declared`
            })
        }

        const newPoint = await Point.create({ 
            game_id, 
            attack: { player_id: round_winner },
            defense: { player_id: round_loser },
            round_number: isPointFound.round_number + 1,
        })

        emitEvent(game_id, {
            for: "Player", 
            game_id,
            round_winner,
            round_loser,
            first_player_winnings,
            second_player_winnings
        })

        return res.status(200).send({
            round_winner, 
            round_loser, 
            first_player_winnings, 
            second_player_winnings, 
            massage: `Current Round Winner Declared`
        })
    } catch(error) {
        console.log('error', error)
        return res.status(500).send({ error: error, massage: `Something went wrong!` })
    }
}
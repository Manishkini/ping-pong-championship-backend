import Championship from "../models/championships.js";
import Game from "../models/games.js";
import mongoose from "mongoose";
import { draw } from "../utils/draw.js";
const ObjectId = mongoose.Types.ObjectId;

export const create = async (req, res) => {
    try {
        const { name, players } = req.body;

        if(!name && !players.length) {
            return res.status(200).send({ massage: `'name', 'players' is required` })
        }
        let playersArrayList = [];
        players.forEach((id) => {
            playersArrayList.push({ player_id: new ObjectId(id), status: "Waiting" })
        })

        const championship = await Championship.create({ name, players: playersArrayList });

        return res.status(200).send({ championship, massage: `Championship created successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const invite = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return res.status(200).send({ massage: `'id' is required` })
        }

        const championship = await Championship.findById(id);

        if(!championship) {
            return res.status(200).send({ massage: `Championship not found!` })
        }

        let playersArrayList = [];
        championship.players.forEach((obj) => {
            playersArrayList.push({ player_id: obj.player_id, status: "Invited" })
        })

        await Championship.updateOne({ _id: id }, { $set: { players: playersArrayList } });

        return res.status(200).send({ massage: `Invitation sent successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const playerJoining = async (req, res) => {
    try {
        const { id, player_id } = req.params;

        if(!id) {
            return res.status(200).send({ massage: `'id' is required` })
        }

        const championship = await Championship.findOne({ _id: id });

        if(!championship) {
            return res.status(200).send({ massage: `Championship not found!` })
        }

        let playersArrayList = [];
        championship.players.forEach((obj) => {
            playersArrayList.push({ player_id: obj.player_id, status: obj.player_id.toString() === player_id ? "Joined" : obj.status });
        })

        await Championship.updateOne({ _id: id }, { $set: { players: playersArrayList } });

        return res.status(200).send({ massage: `Player Joined successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const start = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return res.status(200).send({ massage: `'id' is required` })
        }

        const championship = await Championship.findById(id);

        if(!championship) {
            return res.status(200).send({ massage: `Championship not found!` })
        }

        await Championship.updateOne({ id }, { Started: "Started" });
        const games = draw(championship.players);
        let roundNumber = 1;
        for await(const game of games) {
            const gameObj = {
                championship_id: championship._id,
                first_player: game[0].player_id,
                second_player: game[1].player_id,
                game_type: "Quarter",
                game_round_number: roundNumber++,
            }
            await Game.create(gameObj);
        }

        return res.status(200).send({ massage: `Championship started successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const getAllChampionshipsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const query = {}

        if(status === 'Initiated') {
            query.status = "Initiated";
        } else if(status === 'Started') {
            query.status = "Started";
        } else if(status === 'Finished') {
            query.status = "Finished";
        }

        const championship = await Championship.find(query);

        return res.status(200).send({ championship, massage: `Championship fetched successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const getAllGamesByChampionshipId = async (req, res) => {
    try {
        const { championship_id } = req.params;

        const games = await Game.find({ championship_id })
        .populate(["first_player", "second_player", "Winner", "Loser"])
        .sort({ game_round_number: 1 });

        return res.status(200).send({ games, massage: `Games fetched successfully` });
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}
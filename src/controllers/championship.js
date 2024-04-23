import Championship from "../models/championships.js";
import Game from "../models/games.js";
import mongoose from "mongoose";
import { draw } from "../utils/draw.js";
import Player from "../models/players.js";
import { emitEvent } from "../configs/socket.js";
const ObjectId = mongoose.Types.ObjectId;

export const create = async (req, res) => {
    try {
        const { name, players } = req.body;

        if(!name && !players.length) {
            return res.status(200).send({ massage: `'name', 'players' is required` })
        }
        let playersArrayList = [];
        players.forEach((obj) => {
            playersArrayList.push({ player_id: new ObjectId(obj._id), player_name: obj.name, status: "Waiting" })
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
            playersArrayList.push({ player_id: obj.player_id, player_name: obj.player_name, status: "Invited" })
        })

        await Championship.updateOne({ _id: id }, { $set: { players: playersArrayList } });

        return res.status(200).send({ massage: `Invitation sent successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const get = async (req, res) => {
    try {
        const { id } = req.params;
        const championship = await Championship.findById(id).populate("players.player_id")
        return res.status(200).send({ championship, massage: `Championship fetched successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const getPlayers = async (req, res) => {
    try {
        const players = await Player.find({}, { name: 1, _id: 1 });
        return res.status(200).send({ players, massage: `Players fetched successfully` })
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
            playersArrayList.push({ player_id: obj.player_id, player_name: obj.player_name, status: obj.player_id.toString() === player_id ? "Joined" : obj.status });
        })

        await Championship.updateOne({ _id: id }, { $set: { players: playersArrayList } });

        emitEvent(id, { player_id: player_id, status: "Joined" });

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

        await Championship.updateOne({ id }, { status: "Started" });
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

        emitEvent(id, { player_id: null, status: "Started" });

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

        const championship = await Championship.find(query).sort({ createdAt: -1 });

        return res.status(200).send({ championship, massage: `Championship fetched successfully` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const getAllGamesByChampionshipId = async (req, res) => {
    try {
        const { championship_id } = req.params;
        const user = req.user;

        const query = {
            championship_id: new ObjectId(championship_id)
        }

        if(user.type === "player") {
            query["$or"] = [
                { first_player: new ObjectId(user._id) },
                { second_player: new ObjectId(user._id) },
            ]
        }

        const games = await Game.find(query)
        .populate(["first_player", "second_player", "Winner", "Loser"])
        .sort({ game_round_number: 1 });

        return res.status(200).send({ games, massage: `Games fetched successfully` });
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const createDraw = async (req, res) => {
    try {
        const { championship_id, type } = req.params;
        let games;

        if(type === 'semi-final') {
            games = await Game.find({ championship_id, game_type: "Quarter" }, { Winner: 1, _id: 0 })
            .populate(["Winner"])
            .sort({ game_round_number: 1 });
    
            const winners = games.map((game) => game.Winner);
    
            const semis = draw(winners);
    
            let roundNumber = 5;
            for await(const game of semis) {
                const gameObj = {
                    championship_id: championship_id,
                    first_player: game[0]._id,
                    second_player: game[1]._id,
                    game_type: "Semi",
                    game_round_number: roundNumber++,
                }
                await Game.create(gameObj);
            }
        } else if(type === 'final') {
            games = await Game.find({ championship_id, game_type: "Semi" }, { Winner: 1, _id: 0 })
            .populate(["Winner"])
            .sort({ game_round_number: 1 });
    
            const winners = games.map((game) => game.Winner);

            const gameObj = {
                championship_id: championship_id,
                first_player: winners[0]._id,
                second_player: winners[1]._id,
                game_type: "Final",
                game_round_number: 7,
            }
            await Game.create(gameObj);
        }

        return res.status(200).send({ games, massage: `Games fetched successfully` });
    } catch(error) {
        console.log(error)
        return res.status(500).send({ error: error })
    }
}
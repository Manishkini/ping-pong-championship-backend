import Referee from "../models/referee.js";
import Player from "../models/players.js";
import bcrypt from 'bcrypt';
import { generateToken } from "../configs/jwt.js";

export const create = async (req, res) => {
    try{
        const { name, type, password, defense_set_length } = req.body;

        if(type === 'referee') {
            if(!name || !password) {
                return res.status(200).send({ massage: `'name', 'password' is required` })
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const referee = await Referee.create({ name, password: hashedPassword });
        } else if(type === 'player') {
            if(!name || !defense_set_length) {
                return res.status(200).send({ massage: `'name', 'password', 'defense set' is required` })
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const player = await Player.create({ name, defense_set_length, password: hashedPassword });
        } else {
            return res.status(200).send({ massage: `'type' is required, it must be either 'referee' or 'player'` })
        }

        return res.status(201).send({ massage: `${type === 'referee' ? 'Referee' : 'Player'} created successfully!` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}

export const login = async (req, res) => {
    try{
        const { name, type, password } = req.body;

        if(!name || !password || !type) {
            return res.status(200).send({ massage: `'name', 'type', 'password' is required` })
        }
        if(type === 'referee') {
            const referee = await Referee.findOne({ name });

            if(!referee) {
                return res.status(200).send({ massage: `referee not found` })
            }

            const isPasswordMatched = await bcrypt.compare(password, referee.password);
            if(isPasswordMatched) {
                const token = await generateToken({ name, type })
                let tempObj = referee._doc;
                delete tempObj.password;
                return res.status(200).send({ token, user: tempObj, massage: `Referee login successfully!` })
            }
        } else if(type === 'player') {
            const player = await Player.findOne({ name });

            if(!player) {
                return res.status(200).send({ massage: `player not found` })
            }

            const isPasswordMatched = await bcrypt.compare(password, player.password);
            if(isPasswordMatched) {
                const token = await generateToken({ name, type, defense_set_length: player.defense_set_length })
                let tempObj = player._doc;
                delete tempObj.password;
                return res.status(200).send({ token, user: tempObj, massage: `Player login successfully!` })
            }
        } else {
            return res.status(200).send({ massage: `'type' is required, it must be either 'referee' or 'player'` })
        }

        return res.status(200).send({ massage: `Password not matched` })
    } catch(error) {
        return res.status(500).send({ error: error })
    }
}
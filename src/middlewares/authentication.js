import { validateToken } from "../configs/jwt.js";
import Referee from "../models/referee.js";
import Player from "../models/players.js";

export const verify = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if(!authorization || !authorization.split(' ')[1]) {
            return res.status(403).send({ massage: "Token Required" });
        }
        
        const token = authorization.split(' ')[1];
        const userDetails = await validateToken(token);
        let user;

        if(userDetails.type === 'referee') {
            user = await Referee.findOne({ name: userDetails.name }, { password: -1 });
            if(!user) {
                return res.status(403).send({ massage: "Referee Not Found" });
            }
        } else if(userDetails.type === 'player') {
            user = await Player.findOne({ name: userDetails.name }, { password: -1 });
            if(!user) {
                return res.status(403).send({ massage: "Player Not Found" });
            }
        } else {
            return res.status(403).send({ massage: "Wrong Request" });
        }
    
        req.user = user;

        next();
    } catch(error) {
        return res.status(400).send({ massage: "Token Expired" });
    }
}

export const verifyReferee = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if(!authorization || !authorization.split(' ')[1]) {
            return res.status(403).send({ massage: "Token Required" });
        }

        const token = authorization.split(' ')[1];
        const userDetails = await validateToken(token);
        let user;

        if(userDetails.type === 'referee') {
            user = await Referee.findOne({ name: userDetails.name }, { password: -1 });
        } else {
            return res.status(403).send({ massage: "Request only allowed for referee's" });
        }

        if(!user) {
            return res.status(403).send({ massage: "Referee Not Found" });
        }
        req.user = user;

        next();

    } catch(error) {
        return res.status(400).send({ massage: "Token Expired" });
    }
}

export const verifyPlayer = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if(!authorization || !authorization.split(' ')[1]) {
            return res.status(403).send({ massage: "Token Required" });
        }

        const token = authorization.split(' ')[1];
        const userDetails = await validateToken(token);
        let user;
        
        if(userDetails.type === 'player') {
            user = await Player.findOne({ name: userDetails.name }, { password: -1 });
        } else {
            return res.status(403).send({ massage: "Request only allowed for player's" });
        }

        if(!user) {
            return res.status(403).send({ massage: "Referee Not Found" });
        }
        req.user = user;

        next();

    } catch(error) {
        console.log('error', error)
        return res.status(400).send({ massage: "Token Expired" });
    }
}
import mongoose, { Schema } from "mongoose";

const playerSchema = new Schema({
    name: {
        type: String,
    },
    password: {
        type: String
    },
    defense_set_length: {
        type: Number
    }
},
{
    timestamps: true
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
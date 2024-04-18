import mongoose, { Schema } from "mongoose";

const pointSchema = new Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    attack: {
        player_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        },
        selected_number: {
            type: Number
        }
    },
    defense: {
        player_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        },
        defense_array: {
            type: [Number]
        }
    },
    round_number: {
        type: Number
    },
    round_winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    round_loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }
},
{
    timestamps: true
});

const Point = mongoose.model('Point', pointSchema);

export default Point;
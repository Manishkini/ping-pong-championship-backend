import mongoose, { Schema } from "mongoose";

const gameSchema = new Schema({
    championship_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Championship'
    },
    first_player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    second_player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    game_type: {
        type: String,
        enum: ["Quarter", "Semi", "Final"],
        default: "Quarter",
    },
    game_round_number: {
        type: Number,
    },
    Winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    Loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    status: {
        type: String,
        enum: ["Initiated", "Started", "Finished"],
        default: "Initiated",
    }
},
{
    timestamps: true
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
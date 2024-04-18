import mongoose, { Schema } from "mongoose";

const championshipSchema = new Schema({
    name: {
        type: String,
    },
    players: {
        type: [Object]
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

const Championship = mongoose.model('Championship', championshipSchema);

export default Championship;
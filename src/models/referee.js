import mongoose, { Schema } from "mongoose";

const refereeSchema = new Schema({
    name: {
        type: String,
    },
    password: {
        type: String
    }
},
{
    timestamps: true
});

const Referee = mongoose.model('Referee', refereeSchema);

export default Referee;
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
})

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
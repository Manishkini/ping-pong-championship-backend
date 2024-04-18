import "dotenv/config"
import "./configs/mongoose.js"
import http from 'http';
import morgan from "morgan";
import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import { initializeSocketIO } from "./configs/socket.js";

const PORT = process.env.PORT || 3000
const app = express();
const server = http.createServer(app);
initializeSocketIO(server)

app.use(morgan('dev'));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', router);

server.listen(PORT, (err) => {
    if(err) {
        console.log(`Something Went Wrong: ${err}`)
    }

    console.log(`Server running on http://localhost:${PORT}`);
})
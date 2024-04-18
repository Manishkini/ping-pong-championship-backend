import { Router } from "express";
import authRouter from './auth.js'
import championshipRouter from './championship.js'
import gameRouter from './game.js'
import pointRouter from './point.js'

const router = Router();

router.use('/auth', authRouter);
router.use('/championship', championshipRouter);
router.use('/game', gameRouter);
router.use('/point', pointRouter);

export default router;
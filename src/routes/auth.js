import { Router } from "express";
import { create, login } from '../controllers/auth.js'
const router = Router();

router.post("/", create);

router.post("/login", login);

export default router;
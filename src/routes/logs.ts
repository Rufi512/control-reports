import { Router } from "express";
import { listLogs, resume } from "../controllers/logs_controller";

const router = Router()

router.get('/list',listLogs) 

router.get('/resume',resume)

export default router
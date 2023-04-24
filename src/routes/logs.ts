import { Router } from "express";
import { listLogs, resumeAdmin, resumeUser } from "../controllers/logs_controller";
import { isAdmin, verifyToken } from "../middlewares/authJwt";

const router = Router()

router.get('/list',[verifyToken,isAdmin],listLogs) 

router.get('/resume/admin',[verifyToken,isAdmin],resumeAdmin)

router.get('/resume',[verifyToken],resumeUser)

export default router
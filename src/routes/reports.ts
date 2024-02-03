import { Router } from "express";
import { deleteEvidences, deleteReport, getReport, list, registerReport, updateReport } from "../controllers/report_controller";
import { getExistingFolder, getIdFolder } from "../libs/mongooseId";
import multer from '../libs/multer'
import { checkReport, isAdmin, verifyToken } from "../middlewares/authJwt";

const router = Router()

router.get('/list',[verifyToken],list)

router.get('/info/:id',[verifyToken],getReport)

router.post('/register',[verifyToken,getIdFolder,multer.array('evidences')],registerReport)

router.put('/update/:id',[verifyToken,checkReport,getExistingFolder,multer.array('evidences')],updateReport)

router.delete('/delete/:id',[verifyToken, isAdmin],deleteReport)

router.post('/delete/evidences/:id',[verifyToken, isAdmin],deleteEvidences)

export default router
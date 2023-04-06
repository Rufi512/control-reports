import { Router } from "express";
import { deleteEvidences, deleteReport, getReport, list, registerReport, updateReport } from "../controllers/report_controller";
import { getExistingFolder, getIdFolder } from "../libs/mongooseId";
import multer from '../libs/multer'

const router = Router()

router.get('/list',list)

router.get('/info/:id',getReport)

router.post('/register',[getIdFolder,multer.array('evidences')],registerReport)

router.put('/update/:id',[getExistingFolder,multer.array('evidences')],updateReport)

router.delete('/delete/:id',deleteReport)

router.post('/delete/evidences/:id',deleteEvidences)

export default router
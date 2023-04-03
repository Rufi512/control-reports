import { Router } from "express";
import { registerEquipment, list, getEquipment, updateEquipment, deleteEvidences, deleteEquipment } from "../controllers/equipment_controller";
import multer from '../libs/multer'
import { getExistingFolder, getIdFolder } from "../libs/mongooseId";

//Generate UUID from folder and id

const router = Router()

router.get('/info/:id',getEquipment)

router.get('/list',list)

router.post('/register',[getIdFolder,multer.array('evidences')],registerEquipment)

router.put('/update/:id',[getExistingFolder,multer.array('evidences')],updateEquipment)

router.delete('/delete/:id',deleteEquipment)

router.post('/delete/evidences/:id',deleteEvidences)

export default router
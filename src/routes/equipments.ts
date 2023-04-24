import { Router } from "express";
import { registerEquipment, getEquipment, updateEquipment, deleteEquipment, list, listSelect } from "../controllers/equipment_controller";
import { verifyToken } from "../middlewares/authJwt";

const router = Router()

router.get('/info/:id',[verifyToken],getEquipment)

router.get('/list',[verifyToken],list)

router.get('/select/list',[verifyToken],listSelect)

router.post('/register',[verifyToken],registerEquipment)

router.put('/update/:id',[verifyToken],updateEquipment)

router.delete('/delete/:id',[verifyToken],deleteEquipment)

export default router
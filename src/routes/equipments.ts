import { Router } from "express";
import { registerEquipment, getEquipment, updateEquipment, deleteEquipment, list, listSelect } from "../controllers/equipment_controller";

const router = Router()

router.get('/info/:id',getEquipment)

router.get('/list',list)

router.get('/select/list',listSelect)

router.post('/register',registerEquipment)

router.put('/update/:id',updateEquipment)

router.delete('/delete/:id',deleteEquipment)

export default router
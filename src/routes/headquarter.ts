import { Router } from "express";
import { deleteHq, infoHq, listHq, registerHq, updateHq, listSelectHq } from "../controllers/headquarters_controller";

const router = Router()

router.get('/list',listHq) 

router.get('/info/:id',infoHq)

router.get('/list/select',listSelectHq)

router.post('/register',registerHq)

router.put('/update/:id',updateHq)

router.delete('/delete/:id',deleteHq)

export default router
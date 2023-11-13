import { Router } from "express";
import { deleteHq, infoHq, listHq, registerHq, updateHq, listSelectHq } from "../controllers/headquarters_controller";
import { isAdmin, verifyToken } from "../middlewares/authJwt";
const router = Router()

router.get('/list',[verifyToken],listHq) 

router.get('/info/:id',[verifyToken],infoHq)

router.get('/list/select',[verifyToken],listSelectHq)

router.post('/register',[verifyToken,isAdmin],registerHq)

router.put('/update/:id',[verifyToken,isAdmin],updateHq)

router.delete('/delete/:id',[verifyToken,isAdmin],deleteHq)

export default router
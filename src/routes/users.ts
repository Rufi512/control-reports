import { Router } from "express";
import {getUsers,createUser,updateUser, infoUser, deleteUser, deleteAvatar, listSelect} from '../controllers/user_controller'
import multer from '../libs/avatarMulter'
import { isAdmin, isUserOrAdmin, verifyToken, verifyTokenValidate } from "../middlewares/authJwt";

const router = Router()

router.get('/list',getUsers)

router.get('/list/select',listSelect)

router.get('/detail/:id',[verifyToken,isUserOrAdmin],infoUser)

router.post('/register',[verifyToken,isAdmin],createUser)

router.put('/update/:id',[verifyToken,isUserOrAdmin,multer.single('avatar')],updateUser)

router.get('/data/user/:id',[verifyTokenValidate],infoUser) // get data used to set in welcome

router.delete('/delete/:id',[verifyToken,isAdmin],deleteUser)

router.delete('/delete/profile/picture/:id',[verifyToken,isUserOrAdmin],deleteAvatar)

export default router
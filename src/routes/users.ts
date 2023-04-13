import { Router } from "express";
import {getUsers,createUser,updateUser, infoUser, deleteUser, deleteAvatar} from '../controllers/user_controller'
import multer from '../libs/avatarMulter'
import { verifyTokenValidate } from "../middlewares/authJwt";

const router = Router()

router.get('/list',getUsers)

router.get('/detail/:id',infoUser)

router.post('/register',createUser)

router.put('/update/:id',[multer.single('avatar')],updateUser)

router.get('/data/user/:id',[verifyTokenValidate],infoUser)

router.delete('/delete/:id',deleteUser)

router.delete('/delete/profile/picture/:id',deleteAvatar)

export default router
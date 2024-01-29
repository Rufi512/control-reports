import { Router } from "express";
import {getUsers,createUser,updateUser, blockUser,unBlockUser, infoUser, deleteUser, deleteAvatar, listSelect} from '../controllers/user_controller'
import multer from '../libs/avatarMulter'
import { isAdmin, isUserOrAdmin, verifyToken, verifyTokenValidate } from "../middlewares/authJwt";

const router = Router()

router.get('/list',[verifyToken],getUsers)

router.get('/list/select',[verifyToken],listSelect)

router.get('/detail/:id',[verifyToken,isUserOrAdmin],infoUser)

router.post('/register',[verifyToken,isAdmin],createUser)

router.put('/update/:id',[verifyToken,isUserOrAdmin,multer.single('avatar')],updateUser)

router.get('/data/user/:id',[verifyTokenValidate],infoUser) // get data used to set in welcome

router.delete('/delete/:id',[verifyToken,isAdmin],deleteUser)

router.put('/block/:id',[verifyToken,isAdmin],blockUser)

router.put('/unblock/:id',[verifyToken,isAdmin],unBlockUser)

router.delete('/delete/profile/picture/:id',[verifyToken,isUserOrAdmin],deleteAvatar)

export default router
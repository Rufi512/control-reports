import {Router} from 'express'
import {signIn} from '../controllers/auth_controller'
import { validateUser } from '../controllers/user_controller'
import { verifyTokenValidate } from '../middlewares/authJwt'
import multer from '../libs/avatarMulter'
const router = Router()

router.post('/login',signIn)

router.post('/verify/user/:id',[verifyTokenValidate,multer.single('avatar')],validateUser)

export default router
import {Router} from 'express'
import {refreshToken, sendCaptcha, signIn} from '../controllers/auth_controller'
import { validateUser } from '../controllers/user_controller'
import { verifyCaptcha, verifyTokenValidate } from '../middlewares/authJwt'
import multer from '../libs/avatarMulter'
const router = Router()

router.get('/captcha',sendCaptcha)

router.post('/login',[verifyCaptcha],signIn)

router.post('/login/tests',signIn)

router.get('/refresh/token',refreshToken)

router.post('/verify/user/:id',[verifyTokenValidate,multer.single('avatar')],validateUser)

export default router
import {Router} from 'express'
import { checkQuestions,getQuests,resetPassword,unblockedUser} from '../controllers/recovery_controller'
import { blockedForAdmin, verifyCaptcha } from '../middlewares/authJwt'

const router = Router()

router.post('/questions',[verifyCaptcha, blockedForAdmin],getQuests)

router.post('/questions/test',getQuests)

router.post('/questions/:id',checkQuestions)

router.post('/unblock/user/:id',unblockedUser)

router.post('/change/password/user/:id',resetPassword)

export default router
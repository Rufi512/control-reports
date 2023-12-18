import {Router} from 'express'
import { checkQuestions,getQuests,resetPassword,unblockedUser} from '../controllers/recovery_controller'
import { verifyCaptcha } from '../middlewares/authJwt'

const router = Router()

router.post('/questions',[verifyCaptcha],getQuests)

router.post('/questions/test',getQuests)

router.post('/questions/:id',checkQuestions)

router.post('/unblock/user/:id',unblockedUser)

router.post('/change/password/user/:id',resetPassword)

export default router
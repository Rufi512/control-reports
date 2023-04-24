import {Router} from 'express'

import { deleteQuestionUser, listQuests, setQuestions } from '../controllers/quests_controller'
import { verifyToken } from '../middlewares/authJwt'

const router = Router()

router.get('/user/:id',[verifyToken],listQuests) //list question for user 

router.post('/register/:id',[verifyToken],setQuestions) // register questions user

router.post('/delete/questions/:id',[verifyToken],deleteQuestionUser)

export default router
import {Router} from 'express'

import { deleteQuestionUser, listQuests, setQuestions } from '../controllers/quests_controller'

const router = Router()

router.get('/user/:id',listQuests) //list question for user 

router.post('/register/questions/:id',setQuestions) // register questions user

router.post('/delete/questions/id', deleteQuestionUser)
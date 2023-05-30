import express from 'express'
import morgan from 'morgan'
import cors from 'cors';
import path from 'path'
import equipments from './routes/equipments'
import reports from './routes/reports'
import auth from './routes/auth';
import users from './routes/users';
import quests from './routes/quests'
import logs from './routes/logs'
import recovery from './routes/recovery'
import headquarter from './routes/headquarter';
import { Request, Response } from 'express';
import { initialSetup } from './libs/initalSetup';
const app = express()

//Settings
app.set('PORT',process.env.PORT || 3000)
//middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//Routes Api
app.use('/api/equipments',equipments)
app.use('/api/reports',reports)
app.use('/api/users',users)
app.use('/api/auth',auth)
app.use('/api/quests',quests)
app.use('/api/logs',logs)
app.use('/api/recovery',recovery)
app.use('/api/headquarter',headquarter)
//Store public documents
app.use('/public/contents/evidences',express.static(path.resolve('public/contents/evidences')))
app.use('/public/users/avatar',express.static(path.resolve('public/users/avatar')))

//Initial Setup
initialSetup()

//Client
const client = path.join(__dirname, "client");

app.use(express.static(client));

app.get("/public/users/avatar/*", (_req:Request, res:Response) => {
    res.sendStatus(404)
});

app.get("*", (_req:Request, res:Response) => {
    res.sendFile('index.html', { root: client });
});


export default app
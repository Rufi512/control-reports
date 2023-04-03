import express from 'express'
import morgan from 'morgan'
import cors from 'cors';
import path from 'path'
import equipments from './routes/equipments'
import { Request, Response } from 'express';
const app = express()

//Settings
app.set('PORT',3000 || process.env.PORT)

//middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//Routes
app.use('/api/equipments',equipments)

//Store public documents
app.use('/public/contents/evidences',express.static(path.resolve('public/contents/evidences')))

//Client
const client = path.join(__dirname, "client");
app.use(express.static(client));
app.get("*", (_req:Request, res:Response) => {
    res.sendFile('index.html', { root: client });
});


export default app
import { Request,Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import user from "../models/user";
import { registerLog } from "../middlewares/verifySignup";
import quest from "../models/quest";
import { validatePassword } from "../middlewares/verifyForms";
dotenv.config();

const secret = process.env.SECRET ? process.env.SECRET : "secretWord";


export const getQuests = async (req:Request,res:Response) =>{
    try{
        const userFound = await user.findOne({
            $or: [{ email: req.body.user }, { ci: req.body.user }],
        });
        
        if(!userFound) return res.status(404).json({message:'Usuario no encontrado'})

        const quests = await quest.find({ user: userFound.id },{answer:0,_id:0,user:0});

        if(quests.length <= 0) return res.status(404).json({message:'No hay preguntas de seguridad registradas'})

        return res.json({id:userFound.id,quests})
    }catch(err){
        console.log(err)
        return res.status(404).json({message:'Usuario no encontrado'})
    }
}

export const checkQuestions = async (req:Request, res:Response) => {
    try {
        let i = 0;

        //Search user by ci or email
        const userFound = await user.findOne({_id:req.params.id});

        if (!userFound)
            return res.status(404).json({ message: "Usuario no encontrado" });
        
        const quests = await quest.find({ user: userFound.id });

        if (quests.length < 1)
            return res.status(400).json({
                message: "No hay preguntas de seguridad registradas :(",
            });

        //Compare Answers

        for (const elm of quests) {
            const matchAnswer = await quest.compareAnswer(
                req.body[i].answer,
                elm.answer
            );

            if (!matchAnswer) {
                return res
                    .status(401)
                    .json({ message: "Respuestas invalidas" });
            }
            i++;
        }

        //If all awnser are corrects send token to recovery

        const token = jwt.sign(
            { id: userFound.id },
            secret + userFound.password,
            {
                expiresIn: "15m",
            }
        );

        return res.json({ token, id: userFound.id });
    } catch (err) {
        console.log(err);

        return res.status(404).json({
            message: "Respuesta de seguridad invalidas",
        });
    }
};

export const resetPassword = async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const token = String(req.headers['x-access-token']) || ''
        console.log(req.headers)
        const userFound = await user.findById(id);
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        const decoded = jwt.verify(token, secret + userFound.password);

        if (decoded && id !== userFound.id) return res.status(400).json({ message: "Información invalidas" });
        if(req.body.password !== req.body.confirmPassword) return res.status(401).json({message:'La contraseñas no son iguales'})
        const validate = await validatePassword(req.body.password)

        if(validate !== '') return res.status(401).json({message:validate})
            
        await user.updateOne(
            { _id: id },
            {
                $set: {
                    password: await user.encryptPassword(req.body.password),
                },
            },
            { upsert: true }
        );
        await registerLog(
            req,
            `El usuario ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci} recupero contraseña`
        );
        return res.json({ message: "Contraseña restablecida! " });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Ticket de cambio de contraseña invalido",
        });
    }
};

export const unblockedUser = async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const token = String(req.headers['x-access-token']) || ''
        const userFound = await user.findById(id);
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });
        if(userFound.block_count < 3) return res.status(401).json({message:'El usuario no esta bloqueado'})
        const decoded:any = jwt.verify(token, secret + userFound.password);

        if (!decoded || decoded.id !== userFound.id) return res.status(401).json({ message: "Información invalidas" });

        await user.updateOne(
            { _id: userFound.id },
            {
                $set: {
                    block_count: 0,
                },
            },
            { upsert: true }
        );
        await registerLog(
            req,
            `El usuario ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci} desbloqueo su usuario`
        );
        return res.json({ message: "Usuario desbloqueado! " });
    } catch (err) {
        console.log(err);
        
        return res.status(400).json({
            message: "Ticket de desbloqueo de usuario invalido",
        });
    }
};
import user from "../models/user";
import role from "../models/role";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { verifySignup, authJwt } from "../middlewares";
import { RoleModel } from "../types/types";
import { UltimateTextToImage } from "ultimate-text-to-image";
dotenv.config();

const secret = process.env.SECRET ? process.env.SECRET : "secretWord";

interface RequestUser extends Request {
    userId?: string;
}
interface RequestRole extends RoleModel, Request {}

export const signIn = async (req: RequestUser, res: Response) => {
    try {
        //Confirmamos si existe el usuario por medio de email o cedula
        if (!req.body.user)
            return res
                .status(404)
                .json({ message: "Llene los campos necesarios" });
        const userFound = await user.findOne({
            $or: [{ email: req.body.user }, { ci: req.body.user }],
        });

        //Get the user master
        const listUsers = await user.paginate({}, {});
        const userAdmin = listUsers.docs[0];

        if (!userFound) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        if (userFound.block_count >= 3)
            return res.status(400).json({
                message:
                    "El usuario esta bloqueado, desbloquee su usuario en: desbloquear usuario",
            });

        req.userId = userFound.id;

        //Comparamos contraseñas
        const matchPassword = await user.comparePassword(
            req.body.password,
            userFound.password
        );

        console.log(matchPassword)

        if (!matchPassword) {
            if (userFound.id !== userAdmin.id && userFound.first_login !== true) {
                await authJwt.blockUser(req.userId || "", false);
            }
            return res.status(401).json({ message: "Contraseña invalida" });
        }

        //Generate token
        let token;
        if (userFound.first_login) {
            token = jwt.sign(
                { id: userFound.id },
                secret + userFound.password,
                {
                    expiresIn: "1h",
                }
            );
        } else {
            token = jwt.sign({ id: userFound.id }, secret, {
                expiresIn: 86400, //24 hours
            });
        }

        const rolFind = await role.findOne({ _id: { $in: userFound.rol } });
        if (!rolFind)
            return res.status(404).json({ message: "Error al ingresar" });

        await verifySignup.registerLog(req.userId || "", "Ingreso de sesión");

        await authJwt.blockUser(req.userId || "", true);

        return res.json({
            user:userFound.id,
            first_login:userFound.first_login,
            token,
            rol: rolFind.name,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fatal en el servidor" });
    }
};

export const sendCaptcha = (_req:Request,res:Response) =>{
    const randomWords = () =>{
         let result = '';  
         let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';    
         let charactersLength = characters.length;  
         for (let i = 0; i < 6; i++) {    
            result += characters.charAt(Math.floor(Math.random() * charactersLength));  
         }  
         return result;
    }

    const captchaText = randomWords()
    // generate image

    const token = jwt.sign({ captcha:captchaText }, secret + captchaText, {
                expiresIn:"10m", 
            });
    
    const image = new UltimateTextToImage(captchaText, {width: 100,height:40,align: "center",
    valign: "middle",useGlyphPadding: true, underlineSize: 2}).render().toDataUrl()

    res.json({token,captcha:image})
}

export const verifyTokenConfirm = (req: RequestRole, res: Response) => {
    console.log(req.rolUser);
    return res.json({ rol: req.rolUser, message: "Token valido" });
};
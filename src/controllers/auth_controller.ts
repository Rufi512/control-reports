import user from "../models/user";
import role from "../models/role";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request,Response } from "express";
import { verifySignup, authJwt } from "../middlewares";
import { IUser, RoleModel } from "../types/types";
dotenv.config();

const secret = process.env.SECRET ? process.env.SECRET : "secretWord";

interface RequestUser extends IUser,Request{}
interface RequestRole extends RoleModel,Request{}

export const signIn = async (req:RequestUser, res:Response) => {
    try {
        //Confirmamos si existe el usuario por medio de email o cedula
        if(!req.body.user) return res.status(404).json({message:'Llene los campos necesarios'})
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
            return res
                .status(400)
                .json({
                    message:
                        "El usuario esta bloqueado, desbloquee su usuario en: desbloquear usuario",
                });

        req.userId = userFound.id;

        //Comparamos contraseñas
        const matchPassword = await user.comparePassword(
            req.body.password,
            userFound.password
        );

        if (!matchPassword) {
            if (userFound.id !== userAdmin.id) {
                await authJwt.blockUser(req,false);
            }
            return res.status(401).json({ message: "Contraseña invalida" });
        }

        //Generamos el token
        const token = jwt.sign({ id: userFound.id }, secret, {
            expiresIn: 86400, //24 hours
        });

        const rolFind = await role.findOne({ _id: { $in: userFound.rol } });
        if(!rolFind) return res.status(404).json({message:"Error al ingresar"})
        await verifySignup.registerLog(req, "Ingreso de sesión");
        await authJwt.blockUser(req, true);
        return res.json({
            token,
            rol: rolFind.name,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fatal en el servidor" });
    }
};

export const verifyTokenConfirm = (req:RequestRole, res:Response) => {
    console.log(req.rolUser);
    return res.json({ rol: req.rolUser, message: "Token valido" });
};
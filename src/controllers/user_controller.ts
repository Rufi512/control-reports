import {Request, Response} from 'express'
import user from "../models/user";
import log from "../models/log";
import role from "../models/role";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {verifyCreateUser} from '../middlewares/verifyForms'
import { verifySignup } from "../middlewares";
dotenv.config();


export const getUsers = async (req:Request, res:Response) => {
    if (req.query) {
        const { limit, page, users } = req.query;
        if (limit && !Number(limit))
            return res
                .status(400)
                .json({ message: "El limite de elementos no es un numero!" });
        if (page && !Number(page))
            return res
                .status(400)
                .json({ message: "El limite de paginas no es un numero!" });
        if (Number(users))
            return res
                .status(400)
                .json({ message: "La búsqueda no es una cadena!" });
    }

    let optionsPagination = {
        lean: false,
        limit: req.query && Number(req.query.limit) ? Number(req.query.limit) : 10,
        page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
        select: { password: 0 },
        populate: { path: "rol", select: { name: 1 } },
    };

    const users = await user.paginate({}, optionsPagination);

    console.log(users);
    if (users.length === 1) {
        return res.status(404).json({ message: "Usuarios no encontrados" });
    }

    return res.json(users);
};

export const getLogs = async (req:Request, res:Response) => {
    try{
    if (req.query) {
        const { limit, page, reqLogs } = req.query;
        if (limit && !Number(limit))
            return res
                .status(400)
                .json({ message: "El limite de elementos no es un numero!" });
        if (page && !Number(page))
            return res
                .status(400)
                .json({ message: "El limite de paginas no es un numero!" });
        if (Number(reqLogs))
            return res
                .status(400)
                .json({ message: "La búsqueda no es una cadena!" });
    }

    let optionsPagination = {
        lean: false,
        limit: req.query && Number(req.query.limit) ? Number(req.query.limit) : 10,
        page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
        sort:{ _id: 'desc'}
    };

    const logs = await log.paginate({}, optionsPagination);

    if (logs.length === 0) {
        return res.status(404).json({ message: "No hay información registrada" });
    }

    return res.json(logs);
}catch(e){
    console.log(e)
    return res.status(500).json({message:'Error en el servidor'})
}
};


export const createUser = async (req:any, res:Response) => {
    try {
        const { ci, firstname, lastname, email, password, rol } = req.body;
        const checkRegister = await verifyCreateUser(req.body)
        console.log(checkRegister)
         if (checkRegister)
            return res.status(400).json({ message: checkRegister.message });

        if (!password)
            return res.status(400).json({
                message: "El usuario necesita una contraseña para ser creado!",
            });
        //Creamos el usuario
        const newUser = new user({
            ci,
            firstname,
            lastname,
            email,
            password: await user.encryptPassword(password),
            rol,
        });

        //Verificamos que exista un rol que pide el usuario
        const foundRoles = await role.findOne({ name: { $in: rol } });
        if (foundRoles) {
            newUser.rol = foundRoles._id;
        }

        if (rol === "") {
            const rolFind = await role.findOne({ name: "user" });
            if(!rolFind) return res.status(404).json({message:'No se puede asignar el rol'})
            newUser.rol = rolFind._id;
        }

        const savedUser = await newUser.save();
        await verifySignup.registerLog(req,`Registro al usuario: ${savedUser.firstname} ${savedUser.lastname} - cedula: ${savedUser.ci}`)
        return res.json({ message: "Usuario Registrado", user:savedUser });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fatal en el servidor" });
    }
};

//Actualiza la información de usuario

export const updateUser = async (req:any, res:Response) => {
    try {
        const validId = mongoose.Types.ObjectId.isValid(
            req.params.id || req.userId
        );

        if (!validId) {
            return res.status(404).json({ message: "ID invalido" });
        }

        const checkRegister = await verifyCreateUser(req.body)
         if (checkRegister)
            return res.status(400).json({ message: checkRegister.message });

        const foundUser = await user.findById(req.params.id || req.userId);
        
        //Request the info from user what make the modification
        const userRequestFind = await user.findById(req.userId);

        const rolFind = await role.findOne({ name: { $in: req.body.rol } });

        if(!rolFind) return res.status(404).json({message:'No se puede asignar el rol'})

        if (req.rolUser) {
            if (req.params.id && req.rolUser !== "Admin") {
                return res
                    .status(404)
                    .json({ message: "No se ha encontrado al usuario" });
            }

            if(rolFind._id !== userRequestFind?.rol && req.rolUser !== "Admin"){
                return res
                    .status(400)
                    .json({ message: "No puedes modificar el rol" });
            }
        }
        // Check if email or ci is in used to other user
        const userFind = await user.findOne({
            $or: [{ email: req.body.email }, { ci: req.body.ci }],
        });

        

        const rolUserRequest = await role.find({
            _id: { $in: userRequestFind?.rol },
        });

        const listUsers = await user.paginate({}, {});
        const userAdmin = listUsers.docs[0];

        if (userAdmin.id === userFind?.id)
            return res
                .status(400)
                .json({ message: "No esta permitido editar a este usuario" });

        if (!foundUser)
            return res.status(404).json({ message: "Usuario no encontrado" });

        if (userFind && userFind.id !== (req.params.id || req.userId)) {
            return res.status(400).json({
                message: "Cambio de email rechazado,el email esta en uso!",
            });
        }


        if (!rolFind) return res.status(400).json({ message: "Rol no existe" });
        //Verify if the user is admin or is the same
        if (rolUserRequest[0].name != "Admin") {
            if (foundUser.id != req.userId) {
                return res.status(401).json({
                    message: "No tienes permisos para modificar al usuario",
                });
            }
        }

        //Allow modification

        if (req.body.password && req.body.allowPassword) {
            await user.updateOne(
                { _id: req.params.id || req.userId },
                {
                    $set: {
                        ci: req.body.ci,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: await user.encryptPassword(req.body.password),
                        rol: rolFind._id,
                    },
                }
            );
        } else {
            await user.updateOne(
                { _id: req.params.id || req.userId },
                {
                    $set: {
                        ci: req.body.ci,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        rol: rolFind._id,
                    },
                }
            );
        }
        await verifySignup.registerLog(req,`Modifico usuario: ${foundUser.firstname} ${foundUser.lastname} - cedula: ${foundUser.ci}`)
        return res.json({ message: "Usuario modificado" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fatal en el servidor" });
    }
};
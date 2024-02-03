import { Request, Response } from "express";
import user from "../models/user";
import log from "../models/log";
import role from "../models/role";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { verifyCreateUser, verifyQuestions } from "../middlewares/verifyForms";
import { registerLog } from "../middlewares/verifySignup";
import fs from "fs";
import quest from "../models/quest";
import { RequestUser } from "../types/types";
import report from "../models/report";
import equipment from "../models/equipment";
dotenv.config();

export const getUsers = async (req: Request, res: Response) => {
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

    const search = req.query.search || "";

    let optionsPagination = {
        lean: false,
        limit:
            req.query && Number(req.query.limit) ? Number(req.query.limit) : 10,
        page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
        sort:{created_at:-1},
        select: { password: 0 },
        populate: { path: "rol", select: { name: 1 } },
    };

    const users = await user.paginate(
        {
            $or: [
                {
                    firstname: new RegExp(String(search), "gi"),
                },
                {
                    lastname: new RegExp(String(search), "gi"),
                },
                {
                    ci: new RegExp(String(search), "gi"),
                },
            ],
        },
        optionsPagination
    );

    if (users.length === 1) {
        return res.status(404).json({ message: "Usuarios no encontrados" });
    }

    return res.json(users);
};

export const listSelect = async (req:Request, res:Response) => {
  try {
    let optionsPagination = {
        lean: false,
        limit:
            req.query && Number(req.query.limit) ? Number(req.query.limit) : 10,
        page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
        select: { password: 0 },
        populate: { path: "rol", select: { name: 1 } },
    };
    const search = req.query.search || ''

    const users = await user.paginate({
      $or: [
                {
                    firstname: new RegExp(String(search), "gi"),
                },
                {
                    lastname: new RegExp(String(search), "gi"),
                },
                {
                    ci: new RegExp(String(search), "gi"),
                },
            ],
  },optionsPagination)

    let newList = [];
    
    for (const elm of users.docs) {
      newList.push({
        label: `${elm.ci} - ${elm.firstname} - ${elm.lastname} - ${elm.position}`,
        value: elm.id,
      });
    }

    return res.json(newList);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getLogs = async (req: Request, res: Response) => {
    try {
        if (req.query) {
            const { limit, page, reqLogs } = req.query;
            if (limit && !Number(limit))
                return res.status(400).json({
                    message: "El limite de elementos no es un numero!",
                });
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
            limit:
                req.query && Number(req.query.limit)
                    ? Number(req.query.limit)
                    : 10,
            page:
                req.query && Number(req.query.page)
                    ? Number(req.query.page)
                    : 1,
            sort: { _id: "desc" },
        };

        const logs = await log.paginate({}, optionsPagination);

        if (logs.length === 0) {
            return res
                .status(404)
                .json({ message: "No hay información registrada" });
        }

        return res.json(logs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const createUser = async (req: any, res: Response) => {
    try {
        const { ci, firstname, lastname, email, password, rol, position } =
            req.body;
        const checkRegister = await verifyCreateUser(req.body, false, "","");

        if (checkRegister)
            return res.status(400).json({ message: checkRegister.message });

        //verify ci
        const foundCi = await user.findOne({ ci: ci });

        if (foundCi)
            return res
                .status(401)
                .json({ message: "La cedula ya pertenece a otra persona" });

        //Verify Email exits
        const foundEmail = await user.findOne({ email: email });

        if (foundEmail)
            return res
                .status(401)
                .json({ message: "El email ya pertenece a un usuario" });

        if (!password)
            return res.status(400).json({
                message: "El usuario necesita una contraseña para ser creado!",
            });
        console.log('here')
        //Creamos el usuario
        const newUser = new user({
            ci,
            firstname,
            lastname,
            email,
            position,
            password: await user.encryptPassword(password),
            rol,
        });

        //Verify if rol exits
        const foundRoles = await role.findOne({ name: { $in: rol.toLowerCase() } });
        if (foundRoles) {
            newUser.rol = foundRoles._id;
        }

        if (rol === "") {
            const rolFind = await role.findOne({ name: "user" });
            if (!rolFind)
                return res
                    .status(404)
                    .json({ message: "No se puede asignar el rol" });
            newUser.rol = rolFind._id;
        }

        const savedUser = await newUser.save();

        await registerLog(req,`Registro al usuario: ${savedUser.firstname} ${savedUser.lastname} - cedula: ${savedUser.ci}`);

        return res.json({ message: "Usuario Registrado", user: savedUser });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ message: "No se ha podido registrar el usuario" });
    }
};

export const infoUser = async (req: Request, res: Response) => {
    try {
        console.log(req.params);
        const userFind = await user.findById(req.params.id,{password:0}).populate("rol");
        if (!userFind)
            return res.status(404).json({ message: "Usuario no encontrado" });


        const quests = await quest.find({user:req.params.id},{answer:0,user:0})

        return res.json({user:userFind,quests:quests});
    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
};

export const validateUser = async (req: any, res: Response) => {
    try {
        const {
            ci,
            firstname,
            lastname,
            email,
            password,
            questions,
            answers
        } = req.body;

        const avatar = req.file?.path || ''

        const checkRegister = await verifyCreateUser(
            req.body,
            true,
            req.userId,
            ""
        );
        const userFound = await user.findById(req.params.id)

        if(!userFound) return res.status(404).json({message:'Usuario no encontrado'})

        if (userFound.block_for_admin) {
            return res.status(400).json({ message: "El usuario esta bloqueado por administrador" });
        }

        const checkQuestions = await verifyQuestions(questions, answers);

        if (checkQuestions !== "") {
            if(req.file && req.file.path)fs.unlinkSync(req.file.path || "");
            return res.status(400).json({ message: checkQuestions });
        }

        if (checkRegister) {
            if(req.file && req.file.path)fs.unlinkSync(req.file.path || "");
            return res.status(400).json({ message: checkRegister.message });
        }


        //Check if user is admin to set position
        let positionUser = userFound.position

        const userAdmin = await user.findById(req.params.id);
            if (!userAdmin) return res.status(401).json({ message: "No se encontro al usuario" });
            const rol = await role.find({ _id: { $in: userAdmin.rol } });
            console.log(userAdmin)
            if (rol[0].name === "admin") {
                positionUser = req.body.position
            }


        const questionsUser = questions.map(async (el: string, i: number) => {
            return {
                question: el,
                answer: await quest.encryptAnswer(answers[i]),
            };
        });

        for (const elm of questionsUser) {
            const quests = await quest.find({ user: req.userId }, { answer: 0 });
            if(quests.length >= 4) continue
            const newQuestion = new quest({
                user: req.userId,
                question: (await elm).question,
                answer: (await elm).answer,
            });

            await newQuestion.save();
        }

        if(avatar !== '' && userFound.avatar){
            if (fs.existsSync(userFound.avatar)){
                fs.unlinkSync(userFound.avatar || "")
            }
        }

        await user.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    ci,
                    firstname,
                    lastname,
                    email,
                    password: await user.encryptPassword(password),
                    position:positionUser,
                    first_login: false,
                    avatar: req.file?.path || userFound.avatar,
                    updated_at: new Date(),
                },
            }
        );

        await registerLog(req,`Se verifico usuario: ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci}`);

        return res.json({ message: "Usuario Verificdo" });
    } catch (err) {
        if(req.file && req.file.path){
             fs.unlinkSync(req.file.path)
        }
        console.log(err);
        return res
            .status(500)
            .json({ message: "No se pudo validar al usuario" });
    }
};

//Actualiza la información de usuario

export const updateUser = async (req: any, res: Response) => {
    try {
        const validId = mongoose.Types.ObjectId.isValid(
            req.params.id || req.userId
        );
        const avatar = req.file?.path || ''

        if (!validId) {
            return res.status(404).json({ message: "ID invalido" });
        }

        const checkRegister = await verifyCreateUser(
            req.body,
            req.body.allowPassword || false,
            req.userId,
            req.params.id 
        );
        if (checkRegister)
            return res.status(400).json({ message: checkRegister.message });

        const userFound = await user.findById(req.params.id || req.userId);

        if(!userFound) return res.status(404).json({message:'Usuario no encontrado'})

        const rolFind = await role.findOne({ name: { $in: req.body.rol } });


        //Check if user is admin to set position
        let positionUser = userFound.position

        const userAdmin = await user.findById(req.userId);
            if (!userAdmin) return res.status(401).json({ message: "No se encontro al usuario" });
            const rol = await role.find({ _id: { $in: userAdmin.rol } });
            console.log(userAdmin)
            if (rol[0].name === "admin") {
                positionUser = req.body.position
            }

        // Check if email or ci is in used to other user
        const userFind = await user.findOne({
            $or: [{ email: req.body.email }, { ci: req.body.ci }],
        });

        if (userFind && userFind.id !== (req.params.id || req.userId)) {
            return res.status(400).json({
                message: "El email o la cedula se encuentra en uso por otro usuario, verifique",
            });
        }

        if(avatar !== '' && userFound.avatar){
            if (fs.existsSync(userFound.avatar)){
                fs.unlinkSync(userFound.avatar || "")
            }
        }

        


        //Allow modification
            await user.updateOne(
                { _id: req.params.id || req.userId },
                {
                    $set: {
                        ci: req.body.ci,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: req.body.allowPassword ? await user.encryptPassword(req.body.password) : userFound.password,
                        rol: rolFind?._id || userFound.rol,
                        avatar:avatar || userFound.avatar,
                        position: positionUser || userFound.position
                    },
                }
            );
       
        await registerLog(req,`Modifico usuario: ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci}`);

        return res.json({ message: "Usuario modificado" });
    } catch (err) {
        console.log(err);
        if(req.file && req.file.path){
             fs.unlinkSync(req.file.path)
        }
        return res.status(500).json({ message: "Error fatal en el servidor" });
    }
};

export const blockUser = async (req:RequestUser, res: Response)=>{
    try{
        const userFound = await user.findById(req.params.id);
        
        if(!userFound) return res.status(404).json({message:'Usuario no encontrado'});
        
        if(userFound.id === req.userId){
            return res.status(400).json({message:'No puedes hacer esta accion'})
        }

        await user.updateOne(
            { _id: req.params.id || req.userId },
            {
                $set: {
                    block_for_admin:true
                },
            }
        );

        await registerLog(req,`Bloqueo al usuario: ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci}`);
        return res.status(200).json({message:'Usuario bloqueado'})

    }catch(e){
        console.log(e)
        return res.status(404).json({message:'Usuario no encontrado'})
    }
}

export const unBlockUser = async (req:RequestUser, res: Response)=>{
    try{
        const userFound = await user.findById(req.params.id);

        if(!userFound) return res.status(404).json({message:'Usuario no encontrado'});
        
        if(userFound.id === req.userId){
            return res.status(400).json({message:'No puedes hacer esta accion'})
        }
        

        await user.updateOne(
            { _id: req.params.id || req.userId },
            {
                $set: {
                    block_for_admin:false
                },
            }
        );

        await registerLog(req,`Desbloqueo al usuario: ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci}`);

        return res.status(200).json({message:'Usuario desbloqueado'})

    }catch(e){
        console.log(e)
        return res.status(404).json({message:'Usuario no encontrado'})
    }
}

export const deleteUser = async (req: RequestUser, res: Response) => {
    try {

        const userFound = await user.findById(req.params.id);
        const listUsers = await user.paginate({}, {});
        const userAdmin = listUsers.docs[0];

        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        const reportUser = await report.findOne({ user: userFound.id })
        if(reportUser){
            return res.status(400).json({message:'El usuario tiene reportes registrados en el sistema'})
        }

        const equipmentUser = await equipment.findOne({ user: userFound.id })
        if(equipmentUser){
            return res.status(400).json({message:'El usuario tiene reportes registrados en el sistema'})
        }


        if (userAdmin.id === userFound.id)
            return res
                .status(400)
                .json({ message: "No esta permitido borrar al usuario" });

        if(userFound.id === req.userId){
            return res.status(400).json({message:'No puedes hacer esta accion'})
        }
        
        const dir = `${userFound.avatar || ''}`;
        if (fs.existsSync(dir)) {
            fs.unlinkSync(dir);
        }

        await quest.deleteMany({user:req.params.id})
        await user.findByIdAndDelete(req.params.id);

        await registerLog(req,`Elimino usuario: ${userFound.firstname} ${userFound.lastname} - cedula: ${userFound.ci}`);

        return res.json({ message: "Usuario eliminado" });
    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
};

export const deleteAvatar = async (req: Request, res: Response) => {
    try {
        const userFound = await user.findById(req.params.id);
        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });
        const dir = `${userFound.avatar || ''}`;
        if (fs.existsSync(dir)) {
            fs.unlinkSync(dir);
        }
        await user.updateOne({_id:req.params.id},{$set: {avatar:''},})
        return res.json({message:'Avatar eliminado'})
    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: "No se ha borrado el avatar" });
    }
};
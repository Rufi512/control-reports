import user from "../models/user";
import role from "../models/role";
import log from "../models/log";
import dotenv from "dotenv";
import ip from 'ip'
import { Request,Response, NextFunction } from "express";
import { RequestUser } from "../types/types";
dotenv.config();

export const checkUser = async (req:Request, res:Response, next:NextFunction) => {
  // Si el usuario ya existe
  const userFind = await user.findOne({
    $or: [{ email: req.body.email }, { ci: req.body.ci }],
  });

  if (userFind)
    return res
      .status(400)
      .json({
        message: "Ya hay un mismo email o cedula registrada en el sistema ",
      });

  return next();
};

export const checkRolesExisted = async (req:Request, res:Response, next:NextFunction) => {
  //Verficamos si existen los roles
  const rols = req.body.rol;
  const rol = await role.findOne({ name: { $in: rols } });

  if (rol || rols === "") {
    return next();
  } else {
    return res.status(400).json({ message: "El rol no existe!" });
  }
};

//Register logs from users
export const registerLog = async (req:RequestUser, reason:string) => {
  try {
    const userIp = req.header('x-forwarded-for') || req.socket.remoteAddress || ip.address();
    let userData
    if(req.userId) userData = await user.findById(req.userId)
    if(!userData) return 
    const newLog = new log({
      user:userData.id,
      ip:userIp,
      reason,
      created_at:new Date()
    })

    console.log(newLog)
    await newLog.save()
  } catch(e) {
    console.log(e)
  }
};


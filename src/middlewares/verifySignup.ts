import user from "../models/user";
import role from "../models/role";
import log from "../models/log";
import reCAPTCHA from "recaptcha2";
import dotenv from "dotenv";
import ip from 'ip'
import { Request,Response, NextFunction } from "express";
dotenv.config();

export const validateCaptcha = async (req:Request, res:Response, next:NextFunction) => {
  const recaptcha = new reCAPTCHA({
    siteKey: process.env.SITE_KEY_CAPTCHA || '', // retrieved during setup
    secretKey: process.env.SERVER_KEY_CAPTCHA || '', // retrieved during setup
    ssl: true, // optional, defaults to true.
    // Disable if you don't want to access
    // the Google API via a secure connection
  });
  recaptcha
    .validate(req.body.recaptcha)
    .then(function () {
      console.log("No es el xokas xd");
      next();
    })
    .catch((errorCodes)=>{
         // invalid
         console.log(recaptcha.translateErrors(errorCodes)); // translate error codes to human readable text
         return res.status(401).json({ message: "Captcha Invalido!" });
    });
};

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
export const registerLog = async (userId:string, reason:string) => {
  try {
    const userIp = ip.address();
    let userData
    if(userId) userData = await user.findById(userId)
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


import jwt from "jsonwebtoken";
import user from "../models/user";
import dotenv from "dotenv";
import role from "../models/role";
import { verifySignup } from "../middlewares";
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/types";
dotenv.config();
const secret = process.env.SECRET || "";
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";

export const verifyToken = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["x-access-token"] || "";

    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });

    const decoded: any = jwt.verify(
      String(token),
      secret + ACCESS_TOKEN_SECRET
    );

    req.userId = decoded.id;

    const userFound = await user.findById(decoded.id, { password: 0 });

    if (!userFound) return res.status(401).json({ message: "Sesion invalida" });

    const rolFound = await role.findOne({ _id: { $in: userFound.rol } });
    if (!rolFound) return res.status(401).json({ message: "Sesion invalida" });

    if (userFound.block_for_admin) return res.status(401).json({ message: "Usuario bloqueado por administrador" });

    req.rolUser = rolFound.name;

    return next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({ message: "Token perdido o no autorizado" });
  }
};

export const verifyTokenValidate = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  //Only used to welcome the user
  try {
    const token = req.headers["x-access-token"] || "";
    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });

    const userFound = await user.findById(req.params.id);

    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });
    if (!userFound.first_login)
      return res
        .status(401)
        .json({ message: "Usuario verificado previamente" });

    if (userFound.block_for_admin) return res.status(401).json({ message: "Usuario bloqueado por administrador" });

    const decoded: any = jwt.verify(String(token), secret + userFound.password + ACCESS_TOKEN_SECRET);
    //Buscamos el usuario que se refiere el token

    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token perdido o no autorizado" });
    console.log(err);
  }
};

export const checkPassword = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  //Check to functions required pass
  try {
    const token = req.headers["x-access-token"];

    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });

    const decoded: any = jwt.verify(
      String(token),
      secret + ACCESS_TOKEN_SECRET
    );

    const userFound = await user.findById(decoded.id);

    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (!req.body.password || req.body.password === "") {
      return res
        .status(404)
        .json({ message: "No se ha recibido la contraseña" });
    }

    const matchPassword = await user.comparePassword(
      req.body.password,
      userFound.password
    );

    console.log("comparePassword", matchPassword);

    if (!matchPassword) {
      return res.status(401).json({ message: "La contraseña es invalida" });
    }

    return next();
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "Problema al comprobar información" });
  }
};

export const verifyCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string = String(req.headers["x-captcha-token"]) || "";
    console.log(req.body, token);
    if (!req.body.captcha || req.body.captcha === "")
      return res.status(403).json({ message: "Complete el captcha" });

    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });

    const decoded: any = jwt.verify(token, secret + CAPTCHA_SECRET);

    if (!decoded) return res.status(403).json({ message: "Captcha no valido" });

    if (decoded.captcha !== req.body.captcha)
      return res.status(403).json({ message: "Captcha invalido" });

    return next();
  } catch (err) {
    console.log(err);
    return res
      .status(403)
      .json({ message: "Captcha invalido, verifique o recargue" });
  }
};

//Count try to access to session
export const blockUser = async (req: RequestUser, resetCount: boolean) => {
  const userFound = await user.findById(req.userId);
  if (!userFound) return;
  const block_count = (userFound.block_count += 1);
  await user.updateOne(
    { _id: req.userId },
    { $set: { block_count: resetCount ? 0 : block_count } }
  );
  if (block_count >= 3 && !resetCount)
    await verifySignup.registerLog(
      req,
      "Usuario bloqueado por varios intento fallidos de iniciar sesion"
    );
};


//Verify if user is block for admin when user request 

export const blockedForAdmin = async (req: RequestUser, res:Response, next: NextFunction) =>{
  try{
    const userFound = await user.findOne({
      $or: [{ email: req.body.user }, { ci: req.body.user }],
  });
  if(!userFound) return res.status(404).json({message:'Usuario no encontrado'})
  if(userFound.block_for_admin) return res.status(403).json({message:'Usuario bloqueado por administrador'})
  return next()
  }catch(err){
    console.log(err)
    return res.status(404).json({message:'Usuario no encontrado'})
}
}

export const isUserOrAdmin = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userFound = await user.findById(req.userId);
    if (!userFound)
      return res
        .status(404)
        .json({ message: "No se ha encontrado al usuario" });

    const rol = await role.find({ _id: { $in: userFound.rol } });

    if (rol[0].name === "admin" || userFound.id === req.params.id) {
      return next();
    }

    return res
      .status(401)
      .json({ message: "No puedes acceder a esta informacion" });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "No puedes acceder a esta informacion" });
  }
};

export const isAdmin = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userFound = await user.findById(req.userId);
    if (!userFound)
      return res.status(401).json({ message: "No se encontro al usuario" });
    const rol = await role.find({ _id: { $in: userFound.rol } });
    console.log(userFound)
    if (rol[0].name === "admin") {
      next();
      return;
    }

    return res
      .status(401)
      .json({ message: "No tienes permisos para acceder a esta información" });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "No tienes permisos para acceder a esta información" });
  }
};
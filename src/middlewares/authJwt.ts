import jwt from "jsonwebtoken";
import user from "../models/user";
import dotenv from "dotenv";
import role from "../models/role";
import { verifySignup } from "../middlewares";
import { Request,Response,NextFunction } from "express";
dotenv.config();
const secret = process.env.SECRET || '';

interface RequestUser extends Request{userId?:string, rolUser?:string}


export const verifyToken = async (req:RequestUser, res:Response, next:NextFunction) => {
  try {
    const token = req.headers["x-access-token"] || '';
    console.log(token);
    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });
    //Verificamos el token con el secret
    const decoded:any = jwt.verify(String(token), secret);
    //Buscamos el usuario que se refiere el token

    req.userId = decoded.id;

    const userFind = await user.findById(decoded.id, { password: 0 });

    if (!userFind)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const rolFind = await role.findOne({ _id: { $in: userFind.rol } });
    if(!rolFind) return res.status(404).json({message:'No se ha encontrado el rol'})
    req.rolUser = rolFind.name

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token perdido o no autorizado" });
  }
};

export const verifyTokenValidate = async (req:RequestUser, res:Response, next:NextFunction) =>{
  try{
    const token = req.headers["x-access-token"] || '';
    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });
   //Verificamos el token con el secret
    const userFind = await user.findById(req.params.id);

    if(!userFind) return res.status(404).json({message:'Usuario no encontrado'})
    if(!userFind.first_login) return res.status(401).json({message:'Usuario verificado previamente'})
    const decoded:any = jwt.verify(String(token), secret + userFind.password);
    //Buscamos el usuario que se refiere el token

    req.userId = decoded.id;
    return next()
  }catch(err){
    return res.status(401).json({ message: "Token perdido o no autorizado" });
    console.log(err)
  }
}

export const verifyTokenExpire = async (req:RequestUser, res:Response) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });
    const decoded:any = jwt.verify(String(token), secret);

    req.userId = decoded.id;

    const userFind = await user.findById(decoded.id, { password: 0 });

    if (!userFind)
      return res.status(404).json({ message: "Usuario no encontrado" });

    return res.status(200)
  } catch (err) {
    return res.status(401).json({ message: "Token perdido o no autorizado" });
  }
};

export const checkPassword = async (req:RequestUser, res:Response, next:NextFunction) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token)
      return res.status(403).json({ message: "No se ha obtenido el token" });
    //Verificamos el token con el secret
    const decoded:any = jwt.verify(String(token), secret);

    //Buscamos el usuario que se refiere el token
    const userFound = await user.findById(decoded.id);

    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if(!req.body.password || req.body.password === ''){
      return res.status(404).json({message: 'No se ha recibido la contraseña'})
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

//Count try to access to session
export const blockUser = async (userId:string,resetCount:boolean) =>{
  const userFound = await user.findById(userId);
  if(!userFound) return
  const block_count = userFound.block_count += 1
  await user.updateOne({_id:userId},{$set:{block_count: resetCount ? 0 : block_count}})
  if(block_count >= 3 && !resetCount) await verifySignup.registerLog(userId,"Usuario bloqueado por varios intento fallidos de iniciar sesion")
}

export const isTeacher = async (req:RequestUser, res:Response, next:NextFunction) => {
  //Request id and search the rol from user

  const userFind = await user.findById(req.userId);
  if(!userFind) return res.status(404).json({message:'No se encontro al usuario'})
  const rol = await role.find({ _id: { $in: userFind.rol } });


  for (const el of rol) {
    if (
      el.name === "User" ||
      el.name === "Moderator" ||
      el.name === "Admin"
    ) {
      next();
      return;
    }
  }

  return res
    .status(403)
    .json({ message: "Debes ser Maestro para completar la acción!" });
};

export const isModerator = async (req:RequestUser, res:Response, next:NextFunction) => {
  const userFind = await user.findById(req.userId);
  if(!userFind) return res.status(404).json({message:'No se encontro al usuario'})

  const rol = await role.find({ _id: { $in: userFind.rol } });

  for (const el of rol) {
    if (el.name === "Moderator" || el.name === "Admin") {
      next();
      return;
    }
  }

  return res
    .status(403)
    .json({ message: "Debes ser Moderador para completa la acción!" });
};

export const isUserOrAdmin = async (req:RequestUser,res:Response,next:NextFunction) =>{
  const userFind = await user.findById(req.userId)
  if(!userFind) return res.status(404).json({message:'No se ha encontrado al usuario'})

  const rol = await role.find({ _id: { $in: userFind.rol } });
  
  if (rol[0].name === "Admin") {
    req.rolUser = rol[0].name
  }

  return next()

}

export const isAdmin = async (req:RequestUser, res:Response, next:NextFunction) => {
  const userFind = await user.findById(req.userId);
  if(!userFind) return res.status(404).json({message:'No se encontro al ussuario'})
  const rol = await role.find({ _id: { $in: userFind.rol } });
  
  if (rol[0].name === "Admin") {
    next();
    return;
  }

  const userAdmin = await user.find();

  if (userAdmin[0].id === req.params.id || userAdmin[0] === req.body.id) {
    return res
      .status(401)
      .json({
        message: "No se admite modificacion a usuario administrador principal",
      });
  }

  return res
    .status(403)
    .json({ message: "Debes ser Administrador para completar la acción!" });
};
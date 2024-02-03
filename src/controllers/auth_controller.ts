import user from "../models/user";
import role from "../models/role";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { verifySignup, authJwt } from "../middlewares";
import { RequestUser } from "../types/types";
import { UltimateTextToImage } from "ultimate-text-to-image";
import session from "../models/session";
dotenv.config();

const secret = process.env.SECRET || "";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "";


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
                message: "El usuario esta bloqueado",
            });

        if (userFound.block_for_admin) {
                return res.status(400).json({ message: "El usuario esta bloqueado por administrador" });
        }

        

        req.userId = userFound.id;


        const rolFind = await role.findOne({ _id: { $in: userFound.rol } });
        
        if(!rolFind) return res.status(404).json({ message: "Error al ingresar" });

        //Comparamos contraseñas
        const matchPassword = await user.comparePassword(
            req.body.password,
            userFound.password
        );

        if (!matchPassword) {
            if (
                userFound.id !== userAdmin.id &&
                userFound.first_login !== true
            ) {
                await authJwt.blockUser(req || "", false);
            }
            return res.status(401).json({ message: "Contraseña invalida" });
        }

        if (userFound.first_login) {
            const token = jwt.sign(
                { id: userFound.id },
                secret + userFound.password + ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "15m",
                }
            );

            return res.json({
                user: {id: userFound.id, rol:rolFind.name},
                first_login: userFound.first_login,
                accessToken:token,
            });
        }


         // Check if token is active from user

        const sessionActive = await session.findOne({user_id: userFound.id})
        let tokenActive = false

         if(sessionActive){
            jwt.verify(
                String(sessionActive.token),
                secret + ACCESS_TOKEN_SECRET,
                async (err,_decode)=>{
                    if(err){
                        await session.findOneAndDelete({user_id:userFound.id})
                        tokenActive = false
                    }else{
                        tokenActive = true
                    }
                }
              );

              if(tokenActive){
                return res.status(401).json({ message: "Su usuario tiene una sesion activa, espere 10 minutos de expiracion " });
              }
         }

        //create access and refresh Token
        const payload = { id: userFound.id, rol: userFound.rol };

        const accessToken = jwt.sign(payload, secret + ACCESS_TOKEN_SECRET, {
            expiresIn: "11m",
        });
        const refreshToken = jwt.sign(payload, secret + REFRESH_TOKEN_SECRET, {
            expiresIn: "12m",
        });


        await verifySignup.registerLog(req || "", "Ingreso de sesión");

        await authJwt.blockUser(req || "", true);

        // Save token in database

        const sessionRegister = new session({
            user_id: userFound.id,
            token:accessToken,
            refresh_token:refreshToken
        })

        await sessionRegister.save()

        return res.json({
            user:{name:`${userFound.firstname} ${userFound.lastname}`,id:userFound.id,rol:rolFind.name,avatar:userFound.avatar},
            first_login: userFound.first_login,
            accessToken,
            refreshToken,
            expireToken: 600000 // 10 mins
        });
    } catch (err) {
        console.log(err);
        return res
            .status(404)
            .json({ message: "Error al ingresar con usuario" });
    }
};

export const sendCaptcha = (_req: Request, res: Response) => {
    const randomWords = () => {
        let result = "";
        let characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    };

    const captchaText = randomWords();
    // generate image
    const token = jwt.sign({ captcha: captchaText }, secret + CAPTCHA_SECRET, {
        expiresIn: "12m",
    });

    const image = new UltimateTextToImage(captchaText, {
        width: 100,
        height: 40,
        align: "center",
        valign: "middle",
        useGlyphPadding: true
    })
        .render()
        .toDataUrl();

    res.json({ token, captcha: image });
};

export const refreshToken = async (req: RequestUser, res: Response) => {
    try {
        const token = req.headers["x-refresh-token"] || "";

        if (!token)
            return res
                .status(401)
                .json({ message: "No se ha obtenido el token" });

        //Verify token
        const decoded: any = jwt.verify(
            String(token),
            secret + REFRESH_TOKEN_SECRET
        );

        //Seach the user
        const userFound = await user
            .findById(decoded.id, { password: 0 })
            .populate("rol");

        if (!userFound)
            return res.status(401).json({ message: "Token expirado" });

        

            const sessionActive = await session.findOne({user_id: userFound.id})
            let tokenActive = false
            // In this case if refresh token expire show error 
             if(sessionActive){
                jwt.verify(
                    String(sessionActive.refresh_token),
                    secret + REFRESH_TOKEN_SECRET,
                    async (err,_decode)=>{
                        if(err){
                            tokenActive = false
                        }else{
                            tokenActive = true
                        }
                    }
                  );
    
                  if(!tokenActive){
                    await session.findOneAndDelete({user_id:userFound.id})
                    return res.status(401).json({ message: "Su usuario vencio su tiempo de conexion, vuelva a ingresar" });
                  }
             }

        //create access and refresh Token
        const payload = { id: userFound.id, rol: userFound.rol };

        const rolFind = await role.findOne({ _id: { $in: userFound.rol } });

        if (!rolFind)
            return res.status(404).json({ message: "Error al ingresar" });

        const accessToken = jwt.sign(payload, secret + ACCESS_TOKEN_SECRET, {
            expiresIn: "11m",
        });
        const refreshToken = jwt.sign(payload, secret + REFRESH_TOKEN_SECRET, {
            expiresIn: "12m",
        });

        await session.updateOne({ user_id: userFound.id },{
            $set: {
              token:accessToken,
              refresh_token:refreshToken
            },
          })

        return res.json({ 
            accessToken, 
            refreshToken, 
            user:{
                name:`${userFound.firstname} ${userFound.lastname}`,
                id:userFound.id,
                rol:rolFind.name,
                avatar:userFound.avatar, 
                
                }, 
            expireToken: 600000 // 10 mins
        });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "Token expirado" });
    }
};


export const logout = async (req: RequestUser, res: Response) =>{
    try{
        await session.findOneAndDelete({user_id:req.userId})
        res.json({message:'Salida de sesion'})
    }catch(err){
        console.log(err)
        res.status(401).json({message:''})
    }
}
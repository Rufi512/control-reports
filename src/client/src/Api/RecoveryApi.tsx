import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const RECOVERY_API = "/api/recovery"

export const getQuestsRecovery = async ({token, captcha,user}:any) =>{
    try {
        const config = {headers:{"x-captcha-token":token}}
        const res = await axios.post(RECOVERY_API + `/questions`,{captcha,user},config)
        return res
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo validar el usuario"
        );
        return err.response;
    }
} 

export const sendQuests = async (id:string,body:any) =>{
	try {
        const res = await axios.post(RECOVERY_API + `/questions/${id}`,body)
        return res
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "Respuestas de seguridad invalidas"
        );
        return err.response;
    }
}

export const unBlockUser = async (id:string) =>{
    try {
        const config = {headers:{'x-access-token':Cookies.get('token')}}
        const res = await axios.post(RECOVERY_API + `/unblock/user/${id}`,{},config)
        return res
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo desbloquear al usuario"
        );
        return err.response;
    }
}

export const recoveryPassword = async (id:string,body:any) =>{
    try {
        const config = {headers:{"x-access-token":Cookies.get('token')}}
        const res = await axios.post(RECOVERY_API + `/change/password/user/${id}`,body,config)
        return res
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "Error al restablecer contraseña"
        );
        return err.response;
    }
}
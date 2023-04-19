import axios, {AxiosError} from 'axios'
import { toast } from 'react-toastify'
const AUTH_API = '/api/auth'

export const getCaptcha = async () =>{
    try {
        const res = await axios.get(AUTH_API + `/captcha`)
        return res
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo obtener el captcha"
        );
        return err.response;
    }
} 

export const loginUser = async ({token, body}:any) =>{
    try {
        const config = {headers:{"x-captcha-token":token}}
        console.log(body)
        const res = await axios.post(AUTH_API + `/login`,body,config)
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

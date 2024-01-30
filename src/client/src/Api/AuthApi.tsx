import axios, {AxiosError} from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
const AUTH_API = '/api/auth'
let timerAlert:any
let timerClose:any
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

export const logout = async () =>{
    try {
        const token = Cookies.get('accessToken')
        const config = {headers:{"x-access-token":token}}
        const res = await axios.post(AUTH_API + `/logout`,{},config)
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

export const refreshToken = async () =>{
    try {
        toast.dismiss('alertToken')
        if(timerAlert) clearTimeout(timerAlert)
        if(timerClose) clearTimeout(timerClose)
        timerAlert = setTimeout(()=>{
            toast.warn('Se cerrara sesion en unos instantes', {
                position: "top-right",
                toastId:'alertToken',
                autoClose: 60000,
                hideProgressBar: true,
                closeOnClick: false,
                closeButton: false,
                pauseOnHover: false,
                draggable: false,
                });

                timerClose = setTimeout(()=>{
                    toast.error("Sesion expirada")
                    window.location.href = '/logout'
                },60000)

            },540000) // 10 minutos
    
        const config = {headers:{"x-refresh-token":Cookies.get('refreshToken')}}
        const res = await axios.get(AUTH_API + `/refresh/token`,config)
        return res
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        if(Cookies.get('refreshToken')) {toast.error(
            message_error?.message || "No se pudo validar el usuario"
        );
    }
        return err.response;
    }
}

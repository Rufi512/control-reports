import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Quest } from "../types/quest";
import Cookies from "js-cookie";
import useAuth from "../hooks/useAuth";
import customFetch from "./axios";
const USERS_API = "/api/users";
const QUESTS_API = "/api/quests"

export const getUsers = async ({ page = 1, limit = 15, search = "" }) => {
    
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.get(
            USERS_API + `/list?page=${page}&limit=${limit}&search=${search}`,
            config
        );
        return res;
    } catch (error) {
        const err = error as AxiosError;
        console.log(err.response?.data);
        return err.response;
    }
};

export const getFirstLogin = async (id:string,token:string) => {
    try {
        const config = {headers:{'x-access-token':Cookies.get('accessToken')}}
        const res = await axios.get(USERS_API + `/data/user/${id}`, config);
        return res;
    } catch (error) {
        const err = error as AxiosError;
        console.log(err.response?.data);
        return err.response;
    }
};

export const getSelectsUsers = async (search = "") => {
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.get(
            USERS_API + `/list/select?search=${search}`,
            config
        );
        return res;
    } catch (error) {
        const err = error as AxiosError;
        console.log(err.response?.data);
        return err.response;
    }
};

export const registerUser = async (body: any) => {
    
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.post(USERS_API + `/register`, body,config);
        if (res.status === 200) toast.success("Usuario registrado");
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo registrar el usuario"
        );
        return err.response;
    }
};

export const validateUser = async (id:string,token:string,body:FormData) =>{
    try {
        const config = {headers:{'x-access-token':Cookies.get('accessToken')}}
        const res = await axios.post(`/api/auth/verify/user/${id}`,body,config);
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo registrar el usuario"
        );
        return err.response;
    }
}

export const getUser = async (id: string) => {
    
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.get(USERS_API + `/detail/${id}`,config);
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(message_error?.message || "No se pudo obtener informacion");
        return err.response;
    }
};

export const getQuests = async (id: string) => {
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.get(QUESTS_API + `/quests/user/${id}`,config);
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(message_error?.message || "No se pudo obtener informacion");
        return err.response;
    }
};

export const registerQuest = async (id: string,body:Quest[]) => {
    
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.post(QUESTS_API + `/register/${id}`, body,config);
         if (res.status === 200) toast.success("Pregunta agregada");
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(message_error?.message || "No se pudo registrar la pregunta de seguridad");
        return err.response;
    }
};

export const deleteQuest = async (id:string,user:string) =>{
    
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.post(QUESTS_API + `/delete/questions/${id}`,{},config);
         if (res.status === 200) toast.success("Pregunta Eliminada");
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(message_error?.message || "No se pudo eliminar la pregunta de seguridad");
        return err.response;
    }
}

export const editUser = async (id: string, body: any) => {
    
    try {
        const config = { headers: { "Content-Type": "multipart/form-data",'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.put(USERS_API + `/update/${id}`, body, config);
        if (res.status === 200) toast.success("Usuario Modificado");
        return res;
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo registrar el usuario"
        );
        return err.response;
    }
};

export const blockUser = async (id: string) =>{
    
    try{
    const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
    const res = await customFetch.put(USERS_API + `/block/${id}`,{},config);
    if (res.status === 200) toast.success("Usuario bloqueado");
    }catch(error){
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo bloquear el usuario"
        );
        return err.response;
    }
}

export const unBlockUser = async (id: string) =>{
    
    try{
    const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
    const res = await customFetch.put(USERS_API + `/unblock/${id}`,{},config);
    if (res.status === 200) toast.success("Usuario Desbloqueado");
    }catch(error){
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo desbloquear el usuario"
        );
        return err.response;
    }
}

export const deleteAvatar = async (id: string) => {
    
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await customFetch.delete(
            USERS_API + `/delete/profile/picture/${id}`,config
        );
        if (res.status === 200) toast.success("Foto de perfil eliminada!");
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo proceder a la accion"
        );
        return err.response;
    }
};


export const deleteUser = async (id: string) => {
    
    const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
    try {
        const res = await axios.delete(
            USERS_API + `/delete/${id}`,config
        );
        if (res.status === 200) toast.success("Usuario eliminado!");
    } catch (error) {
        const err = error as AxiosError;
        const message_error: any = err.response?.data;
        toast.error(
            message_error?.message || "No se pudo registrar el usuario"
        );
        return err.response;
    }
};
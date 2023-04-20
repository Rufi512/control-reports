import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Quest } from "../types/quest";
const USERS_API = "/api/users";
const QUESTS_API = "/api/quests"

export const getUsers = async ({ page = 1, limit = 15, search = "" }) => {
    try {
        const res = await axios.get(
            USERS_API + `/list?page=${page}&limit=${limit}&search=${search}`
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
        const config = {headers:{'x-access-token':token}}
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
        const res = await axios.get(
            USERS_API + `/list/select?search=${search}`
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
        const res = await axios.post(USERS_API + `/register`, body);
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
        const config = {headers:{'x-access-token':token}}
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
        const res = await axios.get(USERS_API + `/detail/${id}`);
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
        const res = await axios.get(QUESTS_API + `/quests/user/${id}`);
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
        const res = await axios.post(QUESTS_API + `/register/${id}`, body);
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
        const res = await axios.post(QUESTS_API + `/delete/questions/${id}`);
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
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const res = await axios.put(USERS_API + `/update/${id}`, body, config);
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

export const deleteAvatar = async (id: string) => {
    try {
        const res = await axios.delete(
            USERS_API + `/delete/profile/picture/${id}`
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
    try {
        const res = await axios.delete(
            USERS_API + `/delete/${id}`
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
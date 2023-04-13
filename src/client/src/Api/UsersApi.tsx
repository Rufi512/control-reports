import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
const USERS_API = "/api/users";

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
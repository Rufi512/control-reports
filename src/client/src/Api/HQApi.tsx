import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const HQ_API = '/api/headquarter'

export const getHeadquarters = async ({ page = 1, limit = 15, search = "" }) => {
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.get(
            HQ_API + `/list?page=${page}&limit=${limit}&search=${search}`,
            config
        );
        return res;
    } catch (error) {
        const err = error as AxiosError;
        console.log(err.response?.data);
        return err.response;
    }
};

export const getHeadquarter = async (id:string) => {
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.get(
            HQ_API + `/info/${id}`,
            config
        );
        return res;
    } catch (error) {
        const err = error as AxiosError;
        console.log(err.response?.data);
        return err.response;
    }
};

export const getSelectsHq = async (search = "") => {
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.get(
            HQ_API + `/list/select?search=${search}`,
            config
        );
        return res;
    } catch (error) {
        const err = error as AxiosError;
        console.log(err.response?.data);
        return err.response;
    }
};

export const registerHeadquarter = async (body:any) => {
    try {
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.post(HQ_API + `/register`, body,config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const updateHeadquarter = async (id:string,body:any) =>{
    try {
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.put(HQ_API + `/update/${id}`, body,config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const deleteHeadquarter = async (id:string) =>{
    try {
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.delete(HQ_API + `/delete/${id}`,config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}
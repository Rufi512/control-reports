import axios, { AxiosError } from "axios"
import Cookies from "js-cookie"
const REPORTS_API = '/api/reports'

export const getReports = async ({page = 1,limit = 15,search = '',searchForDate = false, date=`${new Date().getFullYear()}-${new Date().getUTCMonth() + 1 < 10 ? '0' : ''}${new Date().getUTCMonth() + 1 }`}) =>{
    try {
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.get(REPORTS_API + `/list?page=${page}&limit=${limit}${searchForDate ? `&date=${date}` : '' }&search=${search}`,config)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 

export const getReport = async (id:string) =>{
    try {
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.get(REPORTS_API + `/info/${id}`,config)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 

export const registerReport = async (body:any) => {
    try {
        const config = { headers: { 'Content-Type': 'multipart/form-data','x-access-token':Cookies.get('accessToken') } };
        const res = await axios.post(REPORTS_API + `/register`, body, config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const updateReport = async (id:string,body:any) =>{
    try {
        const config = { headers: { 'Content-Type': 'multipart/form-data','x-access-token':Cookies.get('accessToken') } };
        const res = await axios.put(REPORTS_API + `/update/${id}`, body, config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const deleteEvidenceReport = async (id:string,evidences:number[]) =>{
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.post(REPORTS_API + `/delete/evidences/${id}`, {evidences_position:evidences},config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const deleteReport = async (id:string) =>{
    try {
        const config = { headers: {'x-access-token':Cookies.get('accessToken') } };
        const res = await axios.delete(REPORTS_API + `/delete/${id}`,config);
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}



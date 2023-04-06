import axios, { AxiosError } from "axios"
const REPORTS_API = '/api/equipments'

export const getEquipments = async ({page = 1,limit = 15,search = '',searchForDate = false, date=`${new Date().getFullYear()}-${new Date().getUTCMonth() + 1 < 10 ? '0' : ''}${new Date().getUTCMonth() + 1 }`}) =>{
    try {
        const res = await axios.get(REPORTS_API + `/list?page=${page}&limit=${limit}${searchForDate ? `&date=${date}` : '' }&search=${search}`)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 

export const getEquipment = async (id:string) =>{
    try {
        const res = await axios.get(REPORTS_API + `/info/${id}`)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 


export const getEquipmentsSelect = async (search:string) =>{
    try {
        const res = await axios.get(REPORTS_API + `/select/list?search=${search}`)
        console.log(res)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
}

export const registerEquipment = async (body:any) => {
    try {
        const res = await axios.post(REPORTS_API + `/register`, body);
        console.log(res)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const updateEquipment = async (id:string,body:any) =>{
    try {
        const res = await axios.put(REPORTS_API + `/update/${id}`, body);
        console.log(res)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const deleteEquipment = async (id:string) =>{
    try {
        const res = await axios.delete(REPORTS_API + `/delete/${id}`);
        console.log(res)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}
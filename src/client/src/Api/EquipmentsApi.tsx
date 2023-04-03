import axios, { AxiosError } from "axios"
const EQUIPMENT_API = '/api/equipments'
export const getEquipments = async ({page = 1,limit = 15,search = '',searchForDate = false, date=`${new Date().getFullYear()}-${new Date().getUTCMonth() + 1 < 10 ? '0' : ''}${new Date().getUTCMonth() + 1 }`}) =>{
    try {
        const res = await axios.get(EQUIPMENT_API + `/list?page=${page}&limit=${limit}${searchForDate ? `&date=${date}` : '' }&search=${search}`)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 

export const getEquipment = async (id:string) =>{
    try {
        const res = await axios.get(EQUIPMENT_API + `/info/${id}`)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 


export const registerEquipment = async (body:any) => {
    try {
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        const res = await axios.post(EQUIPMENT_API + `/register`, body, config);
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
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        const res = await axios.put(EQUIPMENT_API + `/update/${id}`, body, config);
        console.log(res)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}

export const deleteEvidenceEquipment = async (id:string,evidences:number[]) =>{
    try {
        const res = await axios.post(EQUIPMENT_API + `/delete/evidences/${id}`, {evidences_position:evidences});
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
        const res = await axios.delete(EQUIPMENT_API + `/delete/${id}`);
        console.log(res)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response  
    }
}



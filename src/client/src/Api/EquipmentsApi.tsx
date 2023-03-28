import axios, { AxiosError } from "axios"
const EQUIPMENT_API = '/api/equipments/'
export const getEquipments = async ({page = 1,limit = 15,search = '',searchForDate = false, date=`${new Date().getFullYear()}-${new Date().getUTCMonth() + 1 < 10 ? '0' : ''}${new Date().getUTCMonth() + 1 }`}) =>{
    try {
        const res = await axios.get(EQUIPMENT_API + `list?page=${page}&limit=${limit}${searchForDate ? `&date=${date}` : '' }&search=${search}`)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 
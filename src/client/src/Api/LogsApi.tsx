import axios,{AxiosError} from "axios"
import Cookies from "js-cookie"

const LOGS_API = '/api/logs'

export const getLogs = async ({page = 1,limit = 15,search = '',searchForDate = false, date=`${new Date().getFullYear()}-${new Date().getUTCMonth() + 1 < 10 ? '0' : ''}${new Date().getUTCMonth() + 1 }`}) =>{
    try {
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.get(LOGS_API + `/list?page=${page}&limit=${limit}${searchForDate ? `&date=${date}` : '' }&search=${search}`,config)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 

export const getResumen = async (rol:string) =>{
    try{
        const config = {headers:{"x-access-token":Cookies.get('accessToken')}}
        const res = await axios.get(LOGS_API + `${rol === 'admin' ? '/resume/admin' : '/resume'}`,config)
        return res
    }catch(error){
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
}

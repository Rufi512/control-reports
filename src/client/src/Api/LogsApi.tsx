import axios,{AxiosError} from "axios"

const LOGS_API = '/api/logs'
export const getLogs = async ({page = 1,limit = 15,search = '',searchForDate = false, date=`${new Date().getFullYear()}-${new Date().getUTCMonth() + 1 < 10 ? '0' : ''}${new Date().getUTCMonth() + 1 }`}) =>{
    try {
        const res = await axios.get(LOGS_API + `/list?page=${page}&limit=${limit}${searchForDate ? `&date=${date}` : '' }&search=${search}`)
        return res
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
} 

export const getResumen = async () =>{
    try{
        const res = await axios.get(LOGS_API + `/resume`)
        return res
    }catch(error){
        const err = error as AxiosError
        console.log(err.response?.data)
        return err.response
    }
}

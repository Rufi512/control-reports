import { Headquarter } from "./headquarter"
import { User } from "./user"

export interface Report {
    description:string,
    register_date:{day:string,month:string,year:string},
    register_date_format:string,
    record_type?:string
    created_at?:string,
    updated_at?:string,
    record_type_custom?:string,
    equipments:string[] | Equipment[]
    note:string,
    user?:User
    hq?:Headquarter
    evidences?:[{file:string,description:string}]
    id?:string
    _id?:string
}

export interface Evidences {
    file?: object | null
    url_file?:string
    description: string
    preview?: string
  }
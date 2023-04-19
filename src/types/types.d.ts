import { Request } from "express"

export interface MongooseId extends Request {
    path_folder?: string,
    id?:mongoose.Types.ObjectId
}

export interface IEquipment{
    [key: string]: any
    description:string,
    asset_number:string,
    model:string,
    serial:string,
    brand:string,
}

export interface ReportModel{
    [key: string]: any
    description:string
    equipments:[]
    register_date:string,
    userId:string
    evidences_description:string[] | string,
    evidences?:Express.Multer.File[],
    evidences_description_new?:string[] | string,
    evidences_description_old?:string[] | string,
    delete_images?:number[],
    record_type:string,
    files:Express.Multer.File[],
    path_folder?: string,
    id?:mongoose.Types.ObjectId
    note?:string

}

export interface UserModel{
    ci:string,
    firstname:string
    lastname:string
    email:string
    password:string
    security_questions:mongoose.Types.ObjectId
    first_login:boolean
    position:string
    rol:mongoose.Types.ObjectId
    block_count:number
    updated_at:date
    avatar?:string
    userId?:string
}

export interface QuestModel{
    user:mongoose.Types.ObjectId
    question:string,
    answer:string
}

export interface LogModel{
    user:string,
    ip:string,
    reason:string,
    date:Date
}

export interface RoleModel{
    rolUser?:string
}
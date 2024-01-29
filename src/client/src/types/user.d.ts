export interface User{
    ci:string,
    firstname:string
    lastname:string
    email:string
    password?:string
    first_login?:boolean
    position:string
    rol?:{name:string}
    rolAssign?:string
    block_count?:number
    updated_at?:date
    avatar?:string
    userId?:string
    block_for_admin?:boolean
    _id?:string
}
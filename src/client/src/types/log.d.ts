import { User } from "./user"
export interface Log{
	ip:string,
	user:User,
	created_at:string,
	reason:string
}
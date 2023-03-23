import mongoose, {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'
import mongoosePaginate  from 'mongoose-paginate-v2'
import { IUser } from '../types/types'

//Typescript interface representing user schema
interface UserModel extends mongoose.PaginateModel<IUser> {
  encryptPassword: (password:string) => Promise<string>
  comparePassword: (password:string,receivedPassword:string) => Promise<string>
}

// Create a new Model type that knows about IUserMethods...

const userSchema = new Schema({
  ci:{
    type: String,
    unique: true
  },

  firstname:{
     type: String,
     required:true
  },

  lastname:{
    type: String,
    required:true
  },
  email:{
    type: String,
    unique: true
  },
  password:{
    type: String,
    required:true
  },
  rol:{
    ref: "role",
    type: Schema.Types.ObjectId
  },
  block_count:{
    type:Number,
    required:true,
    default:0
  }
},{
  versionKey:false
})


//Encrypt Password
userSchema.statics.encryptPassword = async (password) =>{
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password,salt)
}

//Compare password
userSchema.statics.comparePassword = async (password,receivedPassword) =>{
  return await bcrypt.compare(password,receivedPassword)
}

userSchema.plugin(mongoosePaginate)



export default model<IUser,UserModel>('user',userSchema)
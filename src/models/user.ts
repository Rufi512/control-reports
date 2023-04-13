import mongoose, {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'
import mongoosePaginate  from 'mongoose-paginate-v2'
import { UserModel } from '../types/types'

//Typescript interface representing user schema
interface User extends mongoose.PaginateModel<UserModel> {
  encryptPassword: (password:string) => Promise<string>
  comparePassword: (password:string,receivedPassword:string) => Promise<string>
}

// Create a new Model type that knows about UserModelMethods...

const userSchema = new Schema({
  ci:{
    type: String,
    unique: true,
    maxLength:12
  },

  firstname:{
     type: String,
     maxLength:40,
     required:true
  },

  lastname:{
    type: String,
    maxLength:40,
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
  position:{
    type:String,
    required:true,
    maxLength:40,
    default:''
  },
  rol:{
    ref: "role",
    type: Schema.Types.ObjectId
  },
  avatar:{
    type:String,
    required:false,
    default:'',
  },
  first_login:{
    type:Boolean,
    required:true,
    default:true,
  },
  block_count:{
    type:Number,
    required:true,
    default:0
  },
  updated_at:{
    type:Date,
    required:true,
    default:new Date()
  }
},{
  versionKey:false
})

userSchema.index({});

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



export default model<UserModel,User>('user',userSchema)
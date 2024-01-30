import {Schema,model} from 'mongoose'

const sessionSchema = new Schema({
  user_id:{type:Schema.Types.ObjectId, require:true},
  token:{type:String, require:true},
  refresh_token:{type:String, require:true}
},{
  versionKey:false
})

export default model("session",sessionSchema)
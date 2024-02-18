import mongoose, {Schema, model} from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { IEquipment } from '../types/types'

const equipmentSchema = new Schema({
  description:{
    type: String,
    required:false,
    default:''
  },
  created_at:{
    type: Date,
    default:new Date()
  },
  updated_at:{
    type: Date,
    default:new Date()
  },
  asset_number:{
    type: String,
    required:false,
    maxLength: 40  
  },
  model:{
    type: String,
    required:true,
    maxLength: 40
  },
  brand:{
    type: String,
    required:true
  },
  serial:{
    type: String,
    required:false,
    maxLength: 40
  },
  user:{
    ref:'user',
    type:Schema.Types.ObjectId,
    require:true
  },
  incorporated:{
    type:Boolean
  },
  register_date:{
    type:Object,
    required:false,
    default:{ day:new Date().getUTCDate(), month:new Date().getUTCMonth() + 1, year:new Date().getFullYear()}
  }, 
},{
  versionKey:false
})


equipmentSchema.index({})

equipmentSchema.plugin(mongoosePaginate)

//Typescript interface representing equipment schema
interface EquipmentDocument extends mongoose.Document,IEquipment {}


export default model<EquipmentDocument,mongoose.PaginateModel<EquipmentDocument>>('equipment',equipmentSchema,'equipment')
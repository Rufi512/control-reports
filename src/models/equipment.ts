import mongoose, {Schema, model} from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { IEquipment } from '../types/types'

const equipmentSchema = new Schema({
  id:{
    type: String,
    unique: true
  },
  description:{
    type: String,
    required:true
  },
  created_at:{
    type: Date,
    default:new Date()
  },
  updated_at:{
    type: Date,
    default:new Date()
  },
  register_date:{
    type:Object,
    required:true
  },
  asset_number:{
    type: String,
    required:true,
    maxLength: 30
  },
  model:{
    type: String,
    required:true,
    maxLength: 30
  },
  record_type:{
    type:String,
    required:true,
    default:'informe',
    maxLength: 30
  },
  brand:{
    type: String,
    required:true
  },

  serial:{
    type: String,
    required:true,
    maxLength: 30
  },
  evidences:{
    type:Array,
    required:false,
    default:[]  
}
},{
  versionKey:false
})


equipmentSchema.index({})

equipmentSchema.plugin(mongoosePaginate)

//Typescript interface representing equipment schema
interface EquipmentDocument extends mongoose.Document,IEquipment {}


export default model<EquipmentDocument,mongoose.PaginateModel<EquipmentDocument>>('equipment',equipmentSchema,'equipment')
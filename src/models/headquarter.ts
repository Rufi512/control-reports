import mongoose, { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { headquarterModel } from "../types/types";

const headquarterSchema = new Schema(
  {
    name:{type:String,require:true,maxLength:50},
    state:{type:String,require:true,maxLength:50},
    location:{type:String,require:true,maxLength:150},
    municipality:{type:String,require:true,maxLength:50},
    city:{type:String,require:true,maxLength:50},
    phone:{type:String,require:false,maxLength:20,default:''},
    circuit_number:{type:String,require:false,maxLength:6,default:''},
    created_at:{type:Date,require:false,default:Date.now()},
    updated_at: {
      type: Date,
      default: new Date(),
    }
  },
  {
    versionKey: false,
  }
);

headquarterSchema.index({});

headquarterSchema.plugin(mongoosePaginate);

//Typescript interface representing report schema
interface HeadquarterDocument extends mongoose.Document, headquarterModel {}

export default model<HeadquarterDocument, mongoose.PaginateModel<HeadquarterDocument>>(
  "headquarter",
  headquarterSchema,
  "headquarter"
);
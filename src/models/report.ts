import mongoose, { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ReportModel } from "../types/types";

const reportSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required:true
    },
    description: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: new Date(),
    },
    updated_at: {
      type: Date,
      default: new Date(),
    },
    register_date: {
      type: Object,
      required: true,
    },
    equipments: {
      ref: "equipment",
      type: [Schema.Types.ObjectId],
      required: true,
    },
    record_type: {
      type: String,
      required: true,
      maxLength: 30,
    },
    evidences: {
      type: Array,
      required: false,
      default: [],
    },
    note: {
      type: String,
      required: false,
      default: "",
    },
    user:{
      ref:'user',
      type:Schema.Types.ObjectId,
      required:true
    }
  },
  {
    versionKey: false,
  }
);

reportSchema.index({});

reportSchema.plugin(mongoosePaginate);

//Typescript interface representing report schema
interface ReportDocument extends mongoose.Document, ReportModel {}

export default model<ReportDocument, mongoose.PaginateModel<ReportDocument>>(
  "report",
  reportSchema,
  "report"
);
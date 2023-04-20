import mongoose, { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { LogModel } from "../types/types";

//Typescript interface representing user schema
interface LogDocument extends mongoose.PaginateModel<LogModel> {}

const logSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    ip: { type: String, required: true },
    reason: { type: String, required: true },
    created_at: { type: Date, default: new Date(), required: true },
    register_date: {
      type: Object,
      required: false,
      default: {
        day: new Date().getUTCDate(),
        month: new Date().getUTCMonth() + 1,
        year: new Date().getFullYear(),
      },
    },
  },
  {
    versionKey: false,
  }
);

logSchema.plugin(mongoosePaginate);

export default model<LogModel, LogDocument>("log", logSchema);
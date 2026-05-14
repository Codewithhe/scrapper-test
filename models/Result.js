import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
   {
      data: Object
   },
   {
      timestamps: true
   }
);

export default mongoose.models.Result ||
mongoose.model("Result", ResultSchema);

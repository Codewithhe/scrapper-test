import dbConnect from "../../lib/mongodb";
import Result from "../../models/Result";

export default async function handler(req, res) {

   try {

      await dbConnect();

      const latest = await Result.findOne()
      .sort({ createdAt: -1 });

      return res.status(200).json({
         success: true,
         data: latest
      });

   } catch (err) {

      return res.status(500).json({
         success: false,
         error: err.message
      });
   }
}

import dbConnect from "../../lib/mongodb";
import Result from "../../models/Result";
import { getResults } from "../../lib/scraper";

export default async function handler(req, res) {

   try {

      await dbConnect();

      const data = await getResults();

      if (!data) {

         return res.status(500).json({
            success: false,
            message: "fetch failed"
         });
      }

      const save = await Result.create({
         data
      });

      return res.status(200).json({
         success: true,
         saved: save,
         data
      });

   } catch (err) {

      return res.status(500).json({
         success: false,
         error: err.message
      });
   }
}

import dbConnect from "../../lib/mongodb";
import Result from "../../models/Result";
import { getResults, ScrapeFetchError } from "../../lib/scraper";

export default async function handler(req, res) {

   try {

      await dbConnect();

      const data = await getResults();

      const save = await Result.create({
         data
      });

      return res.status(200).json({
         success: true,
         saved: save,
         data
      });

   } catch (err) {

      if (err instanceof ScrapeFetchError) {

         return res.status(502).json({
            success: false,
            message: err.message,
            upstreamStatus: err.upstreamStatus
         });
      }

      return res.status(500).json({
         success: false,
         error: err.message
      });
   }
}
